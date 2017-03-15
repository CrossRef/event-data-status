# Event Data Status Service

Collect heartbeats from across Event Data.

## Docker

A Docker image is used for deployment. A Docker Compose file is included for testing only.

## Tinkering

Start the server (NB you must specify port mappings for `docker compose-run`)

    docker-compose run -w /code --publish "8003:8003" test lein run

Then you can post additive updates (count per minute):

    curl --verbose --header "Content-Type: text/plain" --data "5" -X POST -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyIxIjoiMSIsInN1YiI6Indpa2lwZWRpYSJ9.w7zV2vtKNzrNDfgr9dfRpv6XYnspILRli_V5vd1J29Q" http://127.0.0.1:8003/status/my-service/my-component/my-facet

or replacement updates (latest value per minute):

    curl --verbose --header "Content-Type: text/plain" --data "5" -X PUT -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyIxIjoiMSIsInN1YiI6Indpa2lwZWRpYSJ9.w7zV2vtKNzrNDfgr9dfRpv6XYnspILRli_V5vd1J29Q" http://127.0.0.1:8003/status/my-service/my-component/my-facet

## Testing

Unit tests:

  - `time docker-compose run -w /code test lein test :unit`

Component tests:

  - `time docker-compose run -w /code test lein test :component`

## Configuration

The following configuration keys must be set in any code that uses these libraries:

| Environment variable | Description                         | Default |
|----------------------|-------------------------------------|---------|
| `REDIS_HOST`         | Redis host                          |         |
| `REDIS_PORT`         | Redis port                          |         |
| `REDIS_DB`           | Redis DB number                     | 0       |
| `S3_KEY`             | AWS Key Id                          |         |
| `S3_SECRET`          | AWS Secret Key                      |         |
| `S3_BUCKET_NAME`     | AWS S3 bucket name                  |         |
| `S3_REGION_NAME`     | AWS S3 bucket region name           |         |
| `JWT_SECRETS`        | Comma-separated list of JTW Secrets |         |

## Status types

 - «service»/heartbeat/tick
 - «service»/artifact/fetch
 - «service»/input/received
 - «service»/input/ok
 - «service»/output/send

## License

Copyright © Crossref

Distributed under the The MIT License (MIT).
