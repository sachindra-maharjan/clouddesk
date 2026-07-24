# Phase 2 — Monorepo Scaffold

## What this phase sets up
A runnable-but-empty skeleton for both sides of CloudDesk, so every feature in
Phase 3 starts from a project that already builds, boots, and connects —
never from a blank folder.

## Layout
```
clouddesk/
├── backend/         Spring Boot 4 (Java 25), Gradle, modular monolith
│   └── src/main/java/io/clouddesk/
│       ├── shared/          cross-cutting config (security, later: web, error handling)
│       └── auth/            per-feature module, layered:
│           ├── domain/         entities, value objects, no framework deps
│           ├── application/    use cases / services, orchestrates domain
│           ├── infrastructure/ JPA repos, external adapters
│           └── interfaces/     REST controllers, DTOs
├── frontend/        Angular 22, standalone + zoneless, feature folders
│   └── src/app/
│       ├── core/            interceptors, guards, app-wide services
│       ├── shared/          reusable components, layout shell
│       └── features/        auth, files, dashboard, ai-reports, profile, settings
└── docker-compose.yml
```

Each backend feature module (`auth`, and later `files`, `dashboard`,
`ai-reports`) follows the same four-layer split. This is what lets each
feature be built test-first without the layers leaking into each other:
domain has zero framework imports, application depends only on domain,
infrastructure implements ports defined by application, interfaces depend on
application. If a single microservice ever needs to be extracted, its module
folder is already isolated.

## Why these choices
- **Single Spring Boot app, package-by-feature-then-layer.** Fewer moving
  parts while learning TDD; extracting `auth` or `files` into its own
  deployable later is a matter of moving a package, not a rewrite, because
  layering is already enforced.
- **JWT, stateless.** `SecurityConfig` is a deliberately permissive
  placeholder right now — it exists only so the app boots. The Auth feature
  replaces it with a real filter chain, written test-first.
- **Angular 22, zoneless, standalone components, feature folders.** No
  NgModules anywhere. `provideZonelessChangeDetection()` is on from the
  start since the whole app leans on signals.
- **NgRx Signal Store per feature**, registered at the route level as each
  feature lands — nothing is registered globally yet.
- **Flyway migration seeds 5 users** (`V1__init_users.sql`). The password
  hashes in that file are placeholders — the Auth feature's first test
  generates real BCrypt hashes and the migration gets updated then.

## Running it

**Backend**
```bash
cd backend
gradle wrapper --gradle-version 8.14   # one-time, generates gradlew (needs network)
./gradlew bootRun
```
Requires a local Postgres, or just use `docker compose up postgres` from the
repo root first.

**Frontend**
```bash
cd frontend
npm install
npm start
```

**Everything, containerized**
```bash
docker compose up --build
```
Frontend on `:4200`, backend on `:8080`, Postgres on `:5432`.

## Verifying the scaffold
- Backend: `./gradlew test` — `CloudDeskApplicationTests` spins up a real
  Postgres via Testcontainers, runs Flyway, and asserts the context loads.
- Frontend: `npm start`, visit `/` — the "Scaffold ready" screen renders.
  Visiting an unknown path renders the 404 screen.

## Next
Phase 3, feature 1: **User Authentication** — login screen becomes real
components, backend gets a test-first JWT login endpoint, frontend wires
them together with an NgRx Signal Store.
