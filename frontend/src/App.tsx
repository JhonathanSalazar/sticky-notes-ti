import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import StickyNote from './StickyNote'
import TrashZone from './TrashZone'
import { api } from './api'
import { useNoteInteractions } from './hooks/useNoteInteractions'
import type { Note } from './types'
import './App.css'

const NOTE_COLORS = ['#fff9c4', '#c8e6c9', '#bbdefb', '#f8bbd0', '#ffe0b2', '#e1bee7']

function randomColor(): string {
  return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]
}

function createNote(x: number, y: number): Note {
  return {
    id: crypto.randomUUID(),
    x: x - 100,
    y: y - 75,
    width: 200,
    height: 150,
    content: '',
    color: randomColor(),
  }
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const trashRef = useRef<HTMLDivElement>(null)
  const { isOverTrash, notesRef, onMoveStart, onResizeStart } = useNoteInteractions(notes, setNotes, trashRef)

  useEffect(() => {
    api.getAll()
      .then(setNotes)
      .finally(() => setLoading(false))
  }, [])

  const handleCanvasDoubleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.note')) return
    const note = createNote(e.clientX, e.clientY)
    setNotes((prev) => [...prev, note])
    api.create(note).catch(() => {
      setNotes((prev) => prev.filter((n) => n.id !== note.id))
    })
  }, [])

  const handleContentChange = useCallback((noteId: string, content: string) => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, content } : n)))
  }, [])

  const handleContentBlur = useCallback((noteId: string) => {
    const snapshot = notesRef.current
    const note = snapshot.find((n) => n.id === noteId)
    if (note) api.update(note).catch(() => setNotes(snapshot))
  }, [notesRef])

  if (loading) {
    return (
      <div className="canvas">
        <p className="canvas-hint">Loading…</p>
      </div>
    )
  }

  return (
    <div className="canvas" onDoubleClick={handleCanvasDoubleClick}>
      {notes.length === 0 && (
        <p className="canvas-hint">Double-click anywhere to create a note</p>
      )}
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          onMoveStart={onMoveStart}
          onResizeStart={onResizeStart}
          onContentChange={handleContentChange}
          onContentBlur={handleContentBlur}
        />
      ))}
      <TrashZone ref={trashRef} isOver={isOverTrash} />
    </div>
  )
}
