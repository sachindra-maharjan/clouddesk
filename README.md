# CloudDesk

A file management workspace with a real-time dashboard and AI-generated
reports, built as a step-by-step TDD tutorial.

- **Backend:** Java 25, Spring Boot 4, PostgreSQL, WebSocket, Spring
  Security (JWT), Gradle, Docker — Clean Architecture, SOLID, TDD.
- **Frontend:** Angular 22 (standalone, zoneless), Tailwind CSS v4, RxJS,
  NgRx + NgRx Signal Store, Docker.

## Tutorial phases
1. **Static templates** — plain HTML/CSS mockups of every screen, all
   linked and downloadable. See `clouddesk-phase1-static.zip`.
2. **Scaffold** (this repo) — monorepo skeleton for both apps. See
   [`docs/00-scaffold.md`](docs/00-scaffold.md).
3. **Feature by feature**, each with its own markdown doc in `docs/`:
   1. User Authentication
   2. File upload with metadata
   3. Analytical Dashboard (widgets, table, charts, live feed)
   4. AI-generated reports
   5. Others (profile, settings)

Each feature follows the same three steps: break the static template into
Angular components with static data → implement the backend test-first →
wire the backend into the UI.

## Quick start
```bash
docker compose up --build
```
Frontend: http://localhost:4200 · Backend: http://localhost:8080

See `docs/00-scaffold.md` for running each side individually.
