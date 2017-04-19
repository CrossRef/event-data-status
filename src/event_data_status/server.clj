(ns event-data-status.server
  (:require [clojure.data.json :as json]
            [clojure.tools.logging :as l]
            [org.httpkit.server :as server]
            [config.core :refer [env]]
            [compojure.core :refer [defroutes GET POST PUT]]
            [ring.util.response :as ring-response]
            [ring.middleware.params :as middleware-params]
            [ring.middleware.content-type :as middleware-content-type]
            [ring.middleware.resource :as middleware-resource]
            [liberator.core :refer [defresource]]
            [clj-time.core :as clj-time]
            [clj-time.format :as clj-time-format]
            [clj-time.coerce :as clj-time-coerce]
            [clj-time.periodic :as clj-time-periodic]
            [clojure.java.io :refer [reader input-stream]]
            [event-data-common.jwt :as jwt]
            [event-data-common.storage.redis :as redis]
            [event-data-common.storage.s3 :as s3]
            [event-data-common.storage.store :as store]
            [clojure.core.async :as async]
            [overtone.at-at :as at-at])
  (:import
           [java.net URL MalformedURLException InetAddress]
           [redis.clients.jedis Jedis JedisPool JedisPoolConfig ScanResult ScanParams JedisPubSub])
  (:gen-class))

(def timeout-seconds
  "Set status keys to expire 10 days after last set."
  864000)

(def redis-prefix
  "Unique prefix applied to every key."
  "status:")

(defn update-at-level
  "Apply a function to items at the given level of a hashmap tree."
  ([hashmap desired-level f] (update-at-level hashmap desired-level f 0))
  ([hashmap desired-level f level]
    (if (= desired-level level)
      (f hashmap)
      (into {} (map (fn [[k v]] [k (update-at-level v desired-level f (inc level))]) hashmap)))))

(def minute-formatter (clj-time-format/formatters :date-hour-minute))
(def hour-formatter (clj-time-format/formatters :date-hour))
(def yyyy-mm-dd-formatter (clj-time-format/formatters :date))

(def minute-formatter-length 16)

(def default-redis-db-str "1")

(defn key-for
  "Generate Redis key for the service-component-facet now."
  [now ^String service ^String component ^String facet]
  (let [now-str (clj-time-format/unparse minute-formatter now)]
    (str now-str "/" service "/" component "/" facet)))

(def redis-store
  "A redis connection for storing subscription and short-term information."
  (delay (redis/build redis-prefix (:redis-host env) (Integer/parseInt (:redis-port env)) (Integer/parseInt (get env :redis-db default-redis-db-str)))))

; Heartbeat
(def schedule-pool (at-at/mk-pool))

; Websocket things
(def channel-hub (atom {}))
(def pubsub-channel-name "__status__broadcast")

(defn broadcast
  "Send event to all websocket listeners."
  [data]
    (doseq [[channel channel-options] @channel-hub]
      (server/send! channel data)))

(defn add!
  "Apply an add for the coordinate and value."
  [service component facet value]
  (try
    ; Set the key in yyyy-mm-dd:hh:mm-service-component-facet format
    ; Also store that key in a per-day set that indexes those keys for later retrieval.
    (let [now (clj-time/now)
          count-k (key-for now service component facet)
          day-k (clj-time-format/unparse yyyy-mm-dd-formatter now)]

      (redis/sorted-set-increment @redis-store day-k count-k value)
      (redis/expire-seconds! @redis-store day-k timeout-seconds)

      ; Broadcast to websockets via pubsub too.
      (redis/publish-pubsub @redis-store pubsub-channel-name (str service "/" component "/" facet ";" value)))
    (catch Exception e (l/error "Failed to add!" service component facet value "because" (.getMessage e)))))

(defn replace!
  "Apply a replace for the coordinate and value."
  [service component facet value]
  (try
    (let [now (clj-time/now)
          count-k (key-for now service component facet)
          day-k (clj-time-format/unparse yyyy-mm-dd-formatter now)]

      (redis/sorted-set-put @redis-store day-k count-k value)
      (redis/expire-seconds! @redis-store day-k timeout-seconds)

      ; Broadcast to websockets via pubsub too.
      (redis/publish-pubsub @redis-store pubsub-channel-name (str service "/" component "/" facet ";" value)))
    (catch Exception e
      (do
        (l/error "Failed to replace!" service component facet value "because" (.getMessage e))
        (.printStackrace e)))))

; Increment current count.
(defresource post-status-coordinate
  [service component facet]
  :allowed-methods [:post]
  :available-media-types ["application/json"]
  :authorized? (fn [ctx]
                 ; Any validated claim OK to post.
                 (-> ctx :request :jwt-claims))
  :malformed? (fn [ctx]
               (try
                 (let [value (Integer/parseInt (slurp (get-in ctx [:request :body])))]
                   [false {::value value}])
                  (catch NumberFormatException _ true)))
  :post! (fn [ctx]
           (let [new-value (add! service component facet (::value ctx))]
             {::new-value (str new-value)}))
  :handle-created (fn [ctx]
              {:status "ok"}))

; Set current count.
(defresource put-status-coordinate
  [service component facet]
  :allowed-methods [:put]
  :available-media-types ["application/json"]
  :authorized? (fn [ctx]
                 ; Any validated claim OK to post.
                 (-> ctx :request :jwt-claims))
  :malformed? (fn [ctx]
               (try
                 (let [value (Integer/parseInt (slurp (get-in ctx [:request :body])))]
                   [false {::value value}])
                  (catch NumberFormatException _ true)))
  :put! (fn [ctx]
           (let [new-value (replace! service component facet (::value ctx))]
             {::new-value (str new-value)}))
  :handle-created (fn [ctx]
              {:status "ok"}))

(defn build-day-structure-service
  "Build day structure by service."
  [day-str]
  ; TODO TIME BOTH
  (let [;all-keys (store/keys-matching-prefix @redis-store day-str)
        day-data (redis/sorted-set-members @redis-store day-str)
        ; seq of [[date service component facet] value] pairs
        ; kvs  (doall (pmap #(vector (vec (.split % "/")) (store/get-string @redis-store %)) all-keys))
        tree (reduce (fn [acc [k cnt]]
                (let [[time-str service component facet] (.split k "/")]
                  (assoc-in acc [service component facet time-str] cnt)))
                {} day-data)
        with-sorted-times (update-at-level tree 3 (partial sort-by first))]
    with-sorted-times))

(defresource get-status-day
  [day-str]
  :allowed-methods [:get]
  :available-media-types ["application/json"]
  :malformed? (fn [ctx]
                (let [ok (try (clj-time-format/parse yyyy-mm-dd-formatter day-str) (catch IllegalArgumentException _ nil))]
                  (not ok)))

  :handle-ok (fn [ctx]
              (let [structure (build-day-structure-service day-str)]
              {:services structure})))

(defn socket-handler [request]
  (l/info "Socket handler")
  (server/with-channel request channel
    (server/on-close channel (fn [status]
                               (swap! channel-hub dissoc channel)))

    (server/on-receive channel (fn [data]
                                 ; Any input is a subscribe.
                                  (swap! channel-hub assoc channel {})))))

(defroutes app-routes
  (GET "/socket" [] socket-handler)

  (GET "/status/today" [] (get-status-day (clj-time-format/unparse yyyy-mm-dd-formatter (clj-time/now))))
  (GET "/status/yesterday" [] (get-status-day (clj-time-format/unparse yyyy-mm-dd-formatter (clj-time/minus (clj-time/now) (clj-time/days 1)))))
  (GET "/status/:date" [date] (get-status-day date))

  ; POST to accumulate.
  (POST "/status/:service/:component/:facet" [service component facet] (post-status-coordinate service component facet))
  ; PUT to replace.
  (PUT "/status/:service/:component/:facet" [service component facet] (put-status-coordinate service component facet))

  (GET "/" [] (ring-response/redirect "http://eventdata.crossref.org")))


(defn wrap-cors
  "Middleware to add a liberal CORS header."
  [handler]
  (fn [request]
    (let [response (handler request)]
      (when response
        (assoc-in response [:headers "Access-Control-Allow-Origin"] "*")))))

(def app
  ; Delay construction to runtime for secrets config value.
  (delay
    (-> app-routes
       middleware-params/wrap-params
       (middleware-resource/wrap-resource "public")
       (jwt/wrap-jwt (:jwt-secrets env))
       (middleware-content-type/wrap-content-type)
       (wrap-cors))))

(defn run-server []
  (let [port (Integer/parseInt (:port env))]
    (l/info "Start pusub listener.")

    ; Listen on pubsub and send to all listening websockets.
    (async/thread (redis/subscribe-pubsub @redis-store pubsub-channel-name #(broadcast %)))

    ; Ping the heartbeat every 10 seconds.
    ; (Every instance in the cluster will do this)
    (at-at/every 10000 #(add! "status" "heartbeat" "ping" 1) schedule-pool)
    (at-at/every 10000 #(replace! "status" "heartbeat" "replace" 1) schedule-pool)

    (l/info "Start server on " port)
    (server/run-server @app {:port port})))
