# ApplyBoard

## Development database

PostgreSQL uses the Docker volume `pg_data` for local persistence.

A versioned development seed is available at `database/init/001-dev-seed.sql` and is mounted into `/docker-entrypoint-initdb.d`. When a new `pg_data` volume is created, the official Postgres image automatically restores this dump.

See `database/README.md` for restore and refresh commands.
