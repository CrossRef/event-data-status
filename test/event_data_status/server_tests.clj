(ns event-data-status.server-tests
  "Tests for the server namespace.
   Most component tests work at the Ring level, including routing.
   These run through all the middleware including JWT extraction."
  (:require [clojure.test :refer :all]
            [clojure.data.json :as json]
            [clojure.tools.logging :as l]
            [event-data-common.storage.store :as store]
            [event-data-common.jwt :as jwt]
            [event-data-status.server :as server]
            [ring.mock.request :as mock]
            [clj-time.core :as clj-time]
            [clj-time.format :as clj-time-format]
            [clojure.java.io :as io])
  (:import [com.auth0.jwt JWTSigner JWTVerifier]))

(defn clear-storage-fixture
  [f]
  ; Clear all keys from Redis.
  (doseq [k (store/keys-matching-prefix @server/redis-store "")]
    (store/delete @server/redis-store k))
  (f))

(use-fixtures :each clear-storage-fixture)

(def jwt-signer
  "Build a signer that corresponds to the secret set in the config via docker-compose.yml ."
  (delay (jwt/build "TEST")))

(deftest ^:component increment-errors
  (testing "Malformed input produces a 400"
    (let [auth (str "Bearer " (jwt/sign @jwt-signer {}))
          empty-result (-> (mock/request :post "/status/my-service/my-component/my-facet")
                           (mock/header "authorization" auth)
                           (mock/body "")
                           (@server/app)
                           :status)

          not-number-result (-> (mock/request :post "/status/my-service/my-component/my-facet")
                             (mock/header "authorization" auth)
                             (mock/body "Five")
                             (@server/app)
                             :status)

          unauthenticated-number (-> (mock/request :post "/status/my-service/my-component/my-facet")
                                   (mock/header "authorization" "Grizzly Bearer")
                                   (mock/body "5")
                                   (@server/app)
                                   :status)]

          (is (= 400 empty-result) "Empty POST should be malfomed")
          (is (= 400 not-number-result) "Non-number POST should be allowed")
          (is (= 401 unauthenticated-number) "Correct number with no auth should be 403"))))

(deftest ^:component roundtrip-increment
  (testing "Counts can be incremented"
      (store/delete @server/redis-store "1986-05-02")

      (let [auth (str "Bearer " (jwt/sign @jwt-signer {}))]
        (clj-time/do-at (clj-time/date-time 1986 05 02 12 00)
          (let [; First get zero value.

                pre-result (->
                             (mock/request :get "/status/1986-05-02")
                             (mock/header "authorization" auth)
                             (@server/app)
                             :body
                             json/read-str)

                ; Then set to 5 (PUT)
                inc-result-1 (->
                               (mock/request :put "/status/my-service/my-component/my-facet")
                               (mock/header "authorization" auth)
                               (mock/body "5")
                               (@server/app)
                               :body
                               json/read-str)

                ; Then get new value.
                result-2 (->
                           (mock/request :get "/status/1986-05-02")
                           (mock/header "authorization" auth)
                           (@server/app)
                           :body
                           json/read-str)

                ; Then increment by 6 (POST)
                inc-result-2 (->
                               (mock/request :post "/status/my-service/my-component/my-facet")
                               (mock/header "authorization" auth)
                               (mock/body "6")
                               (@server/app)
                               :body
                               json/read-str)

                ; Then get new value.
                result-4 (->
                           (mock/request :get "/status/1986-05-02")
                           (mock/header "authorization" auth)
                           (@server/app)
                           :body
                           json/read-str)]

            (is (= {"services" {}} pre-result) "GET Status for service/component/facet should be zero initially.")
            (is (= {"status" "ok"} inc-result-1) "Should be POSTed OK")
            (is (= {"services" {"my-service" {"my-component" {"my-facet" [["1986-05-02T12:00" 5.0]]}}}} result-2) "GET Status should reflect new value.")
            (is (= {"status" "ok"} inc-result-2) "Should be POSTed OK")
            (is (= {"services" {"my-service" {"my-component" {"my-facet" [["1986-05-02T12:00" 11.0]]}}}} result-4) "GET Status should again reflect new value."))))))

