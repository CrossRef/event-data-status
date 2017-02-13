# To build and tag a version:

: ${TAG:?"Need to set TAG for release"}

docker build -f Dockerfile -t crossref/event-data-status:$TAG .

docker push crossref/event-data-status:$TAG
