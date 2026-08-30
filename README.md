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

Note: the server also applies pending migrations on startup, so a fresh
database is set up even if you skip this step.

## 5. Seed demo data

Load the example services so the API returns data:

```bash
npm run seed
```

The seed is idempotent. Run it again at any time to reset the demo data.

## 6. Start the API

Start the server in watch mode:

```bash
npm run start:dev
```

The API listens on port 3000. To use a different port, set the `PORT` variable:

```bash
PORT=3002 npm run start:dev
```

## Authentication

Every endpoint requires a bearer token. Send it in the `Authorization` header:

```
Authorization: Bearer <token>
```

There are two roles for authz.
- `user` - read
- `admin` - read and write

For demonstration purposes: there is no login endpoint. Mint a fixed JWT for the test sessions:

```bash
npm run mint-token admin
npm run mint-token user
```

For convenience, these pre-minted demo tokens work with the default
`JWT_SECRET` in `.env.example`:

```
# admin (read + write)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi1kZW1vIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzg4MDYyMTcxfQ.-mX5F4M7t5LMKR4YH08ufjIvVIFM8lH10QbHQWCgDvs

# user (read only)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWRlbW8iLCJyb2xlIjoidXNlciIsImlhdCI6MTc4ODA2MjE3Mn0.-Cq7jRcbRqXoCHSVHmg_pUVmlKjNyHp6LbjuQR55E4Y
```

Use the token in a request:

```bash
ADMIN=$(npm run mint-token admin --silent)
curl -H "Authorization: Bearer $ADMIN" localhost:3000/api/v1/services
```

The API returns these codes:

- `401` when the token is missing or invalid
- `403` when a request is denied permission

## API documentation

View OpenAPI specification:

```
http://localhost:3000/api/docs
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
