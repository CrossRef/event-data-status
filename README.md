# Event Data Status Service

Collect heartbeats from across Event Data.

## Docker

A Docker image is used for deployment. A Docker Compose file is included for testing only.

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

## License

Copyright © 2016 FIXME

Distributed under the Eclipse Public License either version 1.0 or (at
your option) any later version.

