# Sticky Notes — Backend

REST API for the sticky notes application. Notes are stored in memory — data resets when the server restarts.

## Tech stack

- [Kotlin](https://kotlinlang.org/) + [Spring Boot 4](https://spring.io/projects/spring-boot)
- Spring Web (REST controllers)
- In-memory storage (`ConcurrentHashMap`) — no database required

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/notes` | Get all notes |
| `POST` | `/api/notes` | Create a note |
| `PUT` | `/api/notes/{id}` | Update a note (position, size, content) |
| `DELETE` | `/api/notes/{id}` | Delete a note |

## Project structure

```
src/main/kotlin/com/stickynotes/
  StickyNotesApplication.kt     — entry point
  model/Note.kt                 — Note data class
  controller/NoteController.kt  — REST endpoints + in-memory store
src/main/resources/
  application.properties        — server port (8080)
```

## Running locally

**Requirements:** JDK 17+

```bash
# Start the server (downloads Gradle automatically on first run)
./gradlew bootRun
```

The API will be available at `http://localhost:8080`.

## Other commands

```bash
# Compile and run tests
./gradlew build

# Run tests only
./gradlew test
```
