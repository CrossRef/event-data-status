(ns event-data-status.core
  (:require [event-data-status.server :as server])
  (:gen-class))

(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (server/run-server))
