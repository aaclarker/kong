# Services Catalog API

A read-mostly API that lists services and their versions.

## Prerequisites

You must install these tools first:

- Node.js 20 (this repo pins the version in `.tool-versions`; use `mise install`).
- Docker with Docker Compose.

If `node` is not on your PATH, prefix each command with `mise exec --`.

## 1. Install dependencies

Run this command:

```bash
npm install
```

## 2. Configure the environment

Copy the example file:

```bash
cp .env.example .env
```

The default values match the Docker database. Do not change them for local use.

## 3. Start the database

Start Postgres in the background:

```bash
docker compose up -d
```

Wait until the database is healthy. Check the status:

```bash
docker compose ps
```

## 4. Create the schema

Run the migrations:

```bash
npm run migration:run
```

Confirm the tables exist:

```bash
docker compose exec postgres psql -U kong -d services -c '\dt'
```

You must see the `services`, `versions`, and `migrations` tables.

## 5. Start the API

Start the server in watch mode:

```bash
npm run start:dev
```

The API listens on port 3000. To use a different port, set the `PORT` variable:

```bash
PORT=3002 npm run start:dev
```

## Database scripts

Use these scripts to manage the schema:

| Command | Action |
| --- | --- |
| `npm run migration:run` | Apply all pending migrations. |
| `npm run migration:revert` | Undo the last migration. |
| `npm run migration:generate -- src/database/migrations/<Name>` | Create a migration from entity changes. |

To generate a migration, do these steps:

1. Change an entity file.
2. Run the generate command with a name. Example:

   ```bash
   npm run migration:generate -- src/database/migrations/AddServiceTags
   ```

3. Run the migration.

## Tests

Run the unit tests:

```bash
npm run test
```

Run the end-to-end tests:

```bash
npm run test:e2e
```
