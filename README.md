# Sticky Notes

A full-stack sticky notes application. Notes can be created, moved, resized, and deleted via drag interactions. Data is persisted server-side.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│                                                     │
│   React + TypeScript (Vite)                         │
│   - Double-click canvas → create note               │
│   - Drag header         → move note                 │
│   - Drag resize handle  → resize note               │
│   - Drag to trash zone  → delete note               │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP /api/notes
                    │ (Vite proxy in dev / Nginx proxy in Docker)
┌───────────────────▼─────────────────────────────────┐
│               Spring Boot (Kotlin)                  │
│                                                     │
│   GET    /api/notes        → list all notes         │
│   POST   /api/notes        → create a note          │
│   PUT    /api/notes/{id}   → update a note          │
│   DELETE /api/notes/{id}   → delete a note          │
│                                                     │
│   In-memory store (ConcurrentHashMap)               │
└─────────────────────────────────────────────────────┘
```

## Project structure

```
sticky-notes-ti/
  frontend/        — React + TypeScript SPA (Vite)
  backend/         — REST API (Kotlin + Spring Boot)
  docker-compose.yml
```

## Running locally

**Requirements:** Node.js 18+, JDK 17+

```bash
# Terminal 1 — backend (http://localhost:8080)
cd backend && ./gradlew bootRun

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm install && npm run dev
```

The Vite dev server proxies `/api` requests to the backend automatically.

## Running with Docker

**Requirements:** Docker with Compose

```bash
docker compose up --build
```

Open `http://localhost` — the frontend is served by Nginx, which also proxies `/api` to the backend container.

```
┌──────────────┐     port 80      ┌─────────────────────┐
│   Browser    │ ───────────────► │  Nginx (frontend)   │
└──────────────┘                  │  /api/* → backend   │
                                  └──────────┬──────────┘
                                             │ port 8080
                                  ┌──────────▼──────────┐
                                  │  Spring Boot (back) │
                                  └─────────────────────┘
```
