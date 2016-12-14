(ns event-data-status.server
  (:require [clojure.data.json :as json]
            [clojure.tools.logging :as l])
  (:require [org.httpkit.server :as server]
            [config.core :refer [env]]
            [compojure.core :refer [defroutes GET POST]]
            [ring.util.response :as ring-response]
            [ring.middleware.params :as middleware-params]
            [ring.middleware.content-type :as middleware-content-type]
            [ring.middleware.resource :as middleware-resource]
            [liberator.core :refer [defresource]]
            [liberator.representation :as representation]
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
           [java.net URL MalformedURLException InetAddress])
  (:gen-class))

(def redis-prefix
  "Unique prefix applied to every key."
  "status:")

(def date-formatter (clj-time-format/formatters :date-hour-minute))

; (def minute-formatter (clj-time-format/formatter "yyyyMMddHHmm"))
(def minute-formatter-length 16)

(def default-redis-db-str "1")

(defn key-for
  "Generate Redis key for the service-component-facet now."
  [^String service ^String component ^String facet]
  (let [now (clj-time/now)
        now-str (clj-time-format/unparse date-formatter now)]
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

; Get current count.
(defresource get-status-coordinate
  [service component facet]
  :allowed-methods [:get]
  :available-media-types ["application/json"]
  :handle-ok (fn [context]
              (let [k (key-for service component facet)
                    v (store/get-string @redis-store k)
                    v-str (str (or v 0))]
                v-str)))

(defn ping!
  "Enact the update and return the new value."
  [service component facet value]
  (try
    (let [k (key-for service component facet)
          new-value (redis/incr-key-by!? @redis-store k value)]
      ; Broadcast to websockets via pubsub too.
      (redis/publish-pubsub @redis-store pubsub-channel-name (str service "/" component "/" facet ";" value))
      new-value)
    (catch Exception e (l/error "Failed to ping" service component facet value "because" (.getMessage e)))))

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
           (let [new-value (ping! service component facet (::value ctx))]
             {::new-value (str new-value)}))
  :handle-created (fn [ctx]
              (::new-value ctx)))

(defn build-minute-structure
  "For a service/component/facet structure and a seq of minute strings, return a seq of values, filling in missing zeroes."
  [[service component facet] minute-prefixes]
  (let [k (str service "/" component "/" facet)]
    (map #(Integer/parseInt (or (store/get-string @redis-store (str % "/" k)) "0")) minute-prefixes)))

(defn build-structure
  "Take a seq of clj-time minutes and return a tree of {service {component {facet {date-time count}}}}"
  [start-date num-minutes]
  (let [minutes (take num-minutes (clj-time-periodic/periodic-seq start-date (clj-time/minutes 1)))
        
        ; as seq of prefixes in Redis.
        ; prefixes are well-formed dates.
        minute-prefixes (map #(clj-time-format/unparse date-formatter %) minutes)

        ; map of {minute matching-keys}
        keys-per-minute (into (sorted-map) (map #(vector % (store/keys-matching-prefix @redis-store %)) minute-prefixes))

        ; get the set of keys present
        all-keys (distinct (mapcat second keys-per-minute))

        ; all keys as triples of [service component facet] ignoring the datetime
        service-keys (map #(rest (.split % "/")) all-keys)

        ; into {service {component {facet minute-structure}}}
        ; where minute-structure is a seq of counts for *all* minutes in date range.
        tree (reduce (fn [acc service-component-facet]
          (assoc-in
            acc
            service-component-facet
            (build-minute-structure service-component-facet minute-prefixes))) {} service-keys)]
    tree))

(defresource get-status-range
  []
  :allowed-methods [:get]
  :available-media-types ["application/json"]
  :malformed? (fn [ctx]
                (let [supplied-end (get-in ctx [:request :params "end"])
                      supplied-hours (get-in ctx [:request :params "hours"])

                      end (if supplied-end
                                (clj-time-format/parse date-formatter supplied-end)
                                (clj-time/now))

                      hours (if supplied-hours
                              (Integer/parseInt supplied-hours)
                              24)

                      start (clj-time/minus end (clj-time/hours hours))

                      ok (<= hours 24)]
                  [(not ok) {::start start ::end end ::hours hours}]))

  :handle-ok (fn [ctx]
              (let [num-minutes (* 60 (::hours ctx))
                    structure (build-structure (::start ctx) num-minutes)]
              {:start (str (::start ctx))
               :end (str (::end ctx))
               :services structure})))


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
  (GET "/status" [] (get-status-range))
  (POST "/status/:service/:component/:facet" [service component facet] (post-status-coordinate service component facet))
  (GET "/status/:service/:component/:facet" [service component facet] (get-status-coordinate service component facet))
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
    (at-at/every 10000 #(ping! "status" "heartbeat" "ping" 1) schedule-pool)

    (l/info "Start server on " port)
    (server/run-server @app {:port port})))
