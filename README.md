# Services Catalog Exercise

A CRUD application serving a Service Catalog

## Considerations

Using the provided tech stack

- Postgres v15
- Node.js v20
- Nest.js v9
- TypeORM v0.3
- TypeScript - v4 chosen for compatibility with Nestjs 9

Additionally
- Docker for portable database
- Mise for tool pinning
- VS Code IDE

Claude Code was used to learn Nestjs conventions, review my architecture decisions, generate project scaffolding, write unit tests, and code review. All features were reviewed or modified by hand.

My goal was to cover as many best practices in API design as time allowed:
- Full CRUD operations
- Authn/authz
- sanitized inputs
- validation at both database and service layers
- OpenAPI documentation

## Assumptions

- Nestjs boilerplate is acceptable and Nestjs conventions are best practice
- **Data model**
  - `versions` were undefined other than a one-to-many relationship to services. I implemented it as an information container with a label and changelog e.g. "2.0.1", "Response schema contract updated"
  - A service _must_ have at least one version. This is enforced through all API operations


## Trade-offs

- Authentication - implemented with JWTs so that I could demonstrate role-based authorization with admin/user at differing permission levels. admin has read/write, user as read-only access.
- Intentionally did not include JWT auth token issuance API for times sake. There is a script to generate 2 test tokens
- Unit test coverage was AI-generated as time saver. I manually smoke tested the API using `curl`. Integration tests and a thorough end-to-end manual test suite would complete the testing story.
- OpenAPI docs are missing response schemas

## Getting started

Prerequisites: Node.js 20 (`mise install`) and Docker.

```bash
npm install
cp .env.example .env
docker compose up -d      # postgres
npm run seed              # load demo data, migrations run on start
npm run start:dev         # API at http://localhost:3000
```

## Authentication

Request require `Authorization: Bearer <json-web-token>`. Two roles: `admin` (read/write)
and `user` (read-only). No login endpoint implemented. Mint tokens with
`npm run mint-token <admin|user>`, or use these demo tokens valid with the `.env.example` secret:

```
admin (read+write): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi1kZW1vIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzg4MDYyMTcxfQ.-mX5F4M7t5LMKR4YH08ufjIvVIFM8lH10QbHQWCgDvs
user  (read-only):  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLWRlbW8iLCJyb2xlIjoidXNlciIsImlhdCI6MTc4ODA2MjE3Mn0.-Cq7jRcbRqXoCHSVHmg_pUVmlKjNyHp6LbjuQR55E4Y
```

Missing token → 401; insufficient role → 403.

```bash
ADMIN=$(npm run mint-token admin --silent)
curl -H "Authorization: Bearer $ADMIN" localhost:3000/api/v1/services
```

## Reference

- **API docs (Swagger):** http://localhost:3000/api/docs
- **Tests:** `npm test`
- **Migrations:** `npm run migration:run` · `migration:revert` · `migration:generate -- src/database/migrations/<Name>`
- **Seed:** `npm run seed` (idempotent, resets database)
