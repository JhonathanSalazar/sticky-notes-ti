import type { Note } from './types'

const BASE = '/api/notes'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

function checked(r: Response): Response {
  if (!r.ok) throw new Error(`API error ${r.status}`)
  return r
}

export const api = {
  getAll: (): Promise<Note[]> =>
    fetch(BASE).then(checked).then((r) => r.json()),

  create: (note: Note): Promise<Note> =>
    fetch(BASE, {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(note),
    }).then(checked).then((r) => r.json()),

  update: (note: Note): Promise<Note> =>
    fetch(`${BASE}/${note.id}`, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(note),
    }).then(checked).then((r) => r.json()),

  remove: (id: string): Promise<void> =>
    fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(checked).then(() => undefined),
}
