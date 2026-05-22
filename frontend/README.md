# Sticky Notes — Frontend

A single-page sticky notes application built with React and TypeScript. Notes are persisted in `localStorage` so they survive page refreshes.

## Features

- **Create** a note by double-clicking anywhere on the canvas
- **Move** a note by dragging its header bar
- **Resize** a note by dragging the handle at the bottom-right corner
- **Delete** a note by dragging it over the trash zone (bottom-right of the screen)

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) — dev server and build tool
- Plain CSS — no external UI libraries
- `localStorage` — client-side persistence

## Project structure

```
src/
  main.tsx        — app entry point
  App.tsx         — root component: state, drag logic, localStorage
  StickyNote.tsx  — individual note (header, textarea, resize handle)
  TrashZone.tsx   — fixed trash drop zone
  types.ts        — Note interface and DragState type
  App.css         — all styles
```

## Running locally

**Requirements:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Other commands

```bash
# Type-check and build for production
npm run build

# Preview the production build
npm run preview
```
