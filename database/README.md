# Database seed

This folder contains the versioned PostgreSQL development seed.

## Automatic restore

`database/init/001-dev-seed.sql` is mounted into the official PostgreSQL image at `/docker-entrypoint-initdb.d`.

PostgreSQL only runs these initialization scripts when the data directory is empty. In this project, that means the seed is applied only when the `pg_data` Docker volume is created for the first time.

## Restore from scratch

To recreate a local development database from the versioned seed:

```bash
docker compose down -v
docker compose up -d database
```

`docker compose down -v` removes the local Postgres volume, so only use it when you intentionally want to discard local database changes.

## Safety

This dump is intended for local development data only. Do not export production data, private credentials, API keys, or real user data into this versioned seed.

## Refresh the seed

After changing the local development data, refresh the versioned dump with:

```bash
docker compose exec -T database pg_dump -U admin -d offers_db --no-owner --no-privileges --clean --if-exists > database/init/001-dev-seed.sql
```

Then commit the updated SQL file with the code that depends on it.
