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
    ; Freeze time.
      (let [auth (str "Bearer " (jwt/sign @jwt-signer {}))]
        (clj-time/do-at (clj-time/date-time 1986 05 02 12 00)
          (let [; First get zero value.

                pre-result (->
                             (mock/request :get "/status/my-service/my-component/my-facet")
                             (mock/header "authorization" auth)
                             (@server/app)
                             :body)

                ; Then increment by 5.
                inc-result-1 (->
                               (mock/request :post "/status/my-service/my-component/my-facet")
                               (mock/header "authorization" auth)
                               (mock/body "5")
                               (@server/app)
                               :body)

                ; Then get new value.
                result-2 (->
                           (mock/request :get "/status/my-service/my-component/my-facet")
                           (mock/header "authorization" auth)
                           (@server/app)
                           :body)

                ; Then increment by 6.
                inc-result-3 (->
                               (mock/request :post "/status/my-service/my-component/my-facet")
                               (mock/header "authorization" auth)
                               (mock/body "6")
                               (@server/app)
                               :body)

                ; Then get new value.
                result-4 (->
                           (mock/request :get "/status/my-service/my-component/my-facet")
                           (mock/header "authorization" auth)
                           (@server/app)
                           :body)]

            (is (= "0" pre-result) "GET Status for service/component/facet should be zero initially.")
            (is (= "5" inc-result-1) "Increment should return new value.")
            (is (= "5" result-2) "GET Status should reflect new value.")
            (is (= "11" inc-result-3) "Increment again should return new value.")
            (is (= "11" result-4) "GET Status should again reflect new value.")))

        ; One minute later.
        (clj-time/do-at (clj-time/date-time 1986 05 02 12 01)
          (let [pre-result (->
                             (mock/request :get "/status/my-service/my-component/my-facet")
                             (mock/header "authorization" auth)
                             (@server/app)
                             :body)]

            (is (= "0" pre-result) "GET Status should be reset the next minute."))))))

(deftest ^:component events-default-24h    
    ; Set one key in this date range so it exists.  
    (let [auth (str "Bearer " (jwt/sign @jwt-signer {}))]
      (clj-time/do-at (clj-time/date-time 1986 05 02 12 01)
        ; Same thing twice in the same minute should accumulate.
        (-> (mock/request :post "/status/my-service/my-component/my-facet")
          (mock/header "authorization" auth)
          (mock/body "1")
          (@server/app))

        (-> (mock/request :post "/status/my-service/my-component/my-facet")
          (mock/header "authorization" auth)
          (mock/body "2")
          (@server/app)))

      ; Update that and another one the next minute.
      (clj-time/do-at (clj-time/date-time 1986 05 02 12 02)
        (-> (mock/request :post "/status/my-service/my-component/my-facet")
          (mock/header "authorization" auth)
          (mock/body "10")
          (@server/app))

        (-> (mock/request :post "/status/my-service/my-component/other-facet")
          (mock/header "authorization" auth)
          (mock/body "18")
          (@server/app))))

    (testing "Fetching events without arguments returns last 24 hours from now."
      ; Query one hour later.
      (clj-time/do-at (clj-time/date-time 1986 05 02 13 00)
        (let [result (->
                             (mock/request :get "/status")
                             (@server/app)
                             :body
                             json/read-str)]

          (is (= "1986-05-02T13:00:00.000Z" (result "end")) "Default end-date should be now")
          (is (= "1986-05-01T13:00:00.000Z" (result "start")) "Default start-date should be now minus 24 hours")

          (is (= (count (get-in result ["services" "my-service" "my-component" "my-facet"])) (* 60 24)) "Correct number of minutes should be returned")
          (is (= (count (get-in result ["services" "my-service" "my-component" "other-facet"])) (* 60 24)) "Correct number of minutes should be returned")

          ; Check that we got the right distinct values.
          (is (= #{0 3 10} (set (get-in result ["services" "my-service" "my-component" "my-facet"]))) "Distinct values should have been summed")
          (is (= #{0 18} (set (get-in result ["services" "my-service" "my-component" "other-facet"]))) "Distinct values should have been summed"))))

    (testing "Fetching custom hours returns that range."
      ; Query one hour later.
      (clj-time/do-at (clj-time/date-time 1986 05 02 12 03)
        (let [result (->
                             (mock/request :get "/status?hours=1")
                             (@server/app)
                             :body
                             json/read-str)]

          (is (= "1986-05-02T12:03:00.000Z" (result "end")) "Default end-date should be now")
          (is (= "1986-05-02T11:03:00.000Z" (result "start")) "Default start-date should be now minus 24 hours")

          (is (= (count (get-in result ["services" "my-service" "my-component" "my-facet"])) 60) "60 minutes should be returned for 1 hour")
          (is (= (count (get-in result ["services" "my-service" "my-component" "other-facet"])) 60) "60 minutes should be returned for 1 hour")

          ; Check that we got the right distinct values.
          (is (= #{0 3 10} (set (get-in result ["services" "my-service" "my-component" "my-facet"]))) "Distinct values should have been summed")
          (is (= #{0 18} (set (get-in result ["services" "my-service" "my-component" "other-facet"]))) "Distinct values should have been summed")

          (is (= [0 0 0 3 10] (take-last 5 (get-in result ["services" "my-service" "my-component" "my-facet"]))) "Correct values should be found at the most recent end of the result.")
          (is (= [0 0 0 0 18] (take-last 5 (get-in result ["services" "my-service" "my-component" "other-facet"]))) "Correct values should be found at the most recent end of the result."))))

    (testing "Fetching more than 24 hours is an error."
      (let [result-status-code (->
                           (mock/request :get "/status?hours=26")
                           (@server/app)
                           :status)]
        (is (= result-status-code 400) "More than 24 hours should be an error"))))

