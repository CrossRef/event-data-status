# Event Data Status Service

FROM clojure:lein-2.7.0-alpine
MAINTAINER Joe Wass jwass@crossref.org

COPY src /usr/src/app/src
COPY test /usr/src/app/test
COPY resources /usr/src/app/resources
COPY project.clj /usr/src/app/project.clj

WORKDIR /code
RUN lein deps
RUN lein compile

