# Services Catalog API

[Exercise](https://docs.google.com/document/d/1wnZu4hu9RsH7COFtpa8af3pQy0NtOGhR54ajZxs61ZE/edit?tab=t.0#heading=h.a7qxkdaatfif)

You're responsible for the data model and API portions of this story. Implement a Services API that can be used to implement this dashboard widget. It should support

- Returning a list of services
  - support filtering, sorting, pagination
- Fetching a particular service
  - including a method for retrieving its versions

The API can be read-only.

## Technical Requirements

Use the following tech stack

- Postgres (we're on v15)
- Node.js (we're on v20)
- Nest.js (we're on v9)
- TypeORM (we're on v0.3)
- TypeScript

## Additional considerations

If you have the time and inclination, consider the following:

- Include tests (unit, integration) or a test plan
- Provide authentication/authorization on the API
- Add CRUD operations to the API

# My Notes

Initial read / Figma exploration:

## Requirements

Minimal read only API

- List endpoint, GET
  - filtering param
  - query param
  - pagination
  - `/api/v1/services`
- Retrieve endpoint, GET
  - `/api/v1/services/:id`
  - retrieve /versions
    - `/api/v1/services/:id/versions`

- **extra scope**: Add new, POST

**Questions**

- is a version required for every service? yes, init at 1
- sorting? name, updated, created
- search? fuzzy name/description
- pagination? need total. offset is fine, cursor overkill for small/slow growing dataset

### Plan

1. Outline API
2. Define data model
3. bootstrap project. Scaffolding, seed data
  - docker-compose for postgres. mise for tool pinning
4. Implement basic API requirements - TDD

## Data model

**`service`** - a user defined record of generic service object

- id: uuid
- name: str
- description: str
- versions: FK `version`

**`version`** - a version of a service. what to put it in it? timestamp, changelog, description. Version label? e.g. "v1", "v2", semver?

- id: uuid
- changelog: str
- description: str
- created_at: timestamp
