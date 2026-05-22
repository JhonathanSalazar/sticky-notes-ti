import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import StickyNote from './StickyNote'
import TrashZone from './TrashZone'
import { api } from './api'
import type { DragState, Note } from './types'
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
  const [isOverTrash, setIsOverTrash] = useState(false)

  // Mirror notes into a ref so mouseup handlers can read current state
  // without stale closure issues (the drag useEffect has [] deps)
  const notesRef = useRef<Note[]>([])
  useEffect(() => { notesRef.current = notes }, [notes])

  const dragRef = useRef<DragState>(null)
  const trashRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.getAll().then(setNotes)
  }, [])

  const handleCanvasDoubleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.note')) return
    const note = createNote(e.clientX, e.clientY)
    setNotes((prev) => [...prev, note])
    api.create(note)
  }, [])

  const handleMoveStart = useCallback((e: MouseEvent, noteId: string) => {
    e.preventDefault()
    setNotes((prev) => {
      const note = prev.find((n) => n.id === noteId)
      if (!note) return prev
      dragRef.current = {
        kind: 'move',
        noteId,
        offsetX: e.clientX - note.x,
        offsetY: e.clientY - note.y,
      }
      return prev
    })
  }, [])

  const handleResizeStart = useCallback((e: MouseEvent, noteId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setNotes((prev) => {
      const note = prev.find((n) => n.id === noteId)
      if (!note) return prev
      dragRef.current = {
        kind: 'resize',
        noteId,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startW: note.width,
        startH: note.height,
      }
      return prev
    })
  }, [])

  const handleContentChange = useCallback((noteId: string, content: string) => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, content } : n)))
  }, [])

  const handleContentBlur = useCallback((noteId: string) => {
    const note = notesRef.current.find((n) => n.id === noteId)
    if (note) api.update(note)
  }, [])

  useEffect(() => {
    const onMouseMove = (e: globalThis.MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return

      if (drag.kind === 'move') {
        const newX = e.clientX - drag.offsetX
        const newY = e.clientY - drag.offsetY
        setNotes((prev) =>
          prev.map((n) => (n.id === drag.noteId ? { ...n, x: newX, y: newY } : n))
        )
        const trash = trashRef.current?.getBoundingClientRect()
        if (trash) {
          setIsOverTrash(
            e.clientX >= trash.left &&
            e.clientX <= trash.right &&
            e.clientY >= trash.top &&
            e.clientY <= trash.bottom
          )
        }
      }

      if (drag.kind === 'resize') {
        const dx = e.clientX - drag.startMouseX
        const dy = e.clientY - drag.startMouseY
        setNotes((prev) =>
          prev.map((n) =>
            n.id === drag.noteId
              ? { ...n, width: Math.max(120, drag.startW + dx), height: Math.max(80, drag.startH + dy) }
              : n
          )
        )
      }
    }

    const onMouseUp = (e: globalThis.MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return

      const trash = trashRef.current?.getBoundingClientRect()
      const isOverTrashZone =
        !!trash &&
        e.clientX >= trash.left &&
        e.clientX <= trash.right &&
        e.clientY >= trash.top &&
        e.clientY <= trash.bottom

      if (drag.kind === 'move') {
        if (isOverTrashZone) {
          setNotes((prev) => prev.filter((n) => n.id !== drag.noteId))
          api.remove(drag.noteId)
        } else {
          const note = notesRef.current.find((n) => n.id === drag.noteId)
          if (note) api.update(note)
        }
      }

      if (drag.kind === 'resize') {
        const note = notesRef.current.find((n) => n.id === drag.noteId)
        if (note) api.update(note)
      }

      dragRef.current = null
      setIsOverTrash(false)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <div className="canvas" onDoubleClick={handleCanvasDoubleClick}>
      {notes.length === 0 && (
        <p className="canvas-hint">Double-click anywhere to create a note</p>
      )}
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          onMoveStart={handleMoveStart}
          onResizeStart={handleResizeStart}
          onContentChange={handleContentChange}
          onContentBlur={handleContentBlur}
        />
      ))}
      <TrashZone ref={trashRef} isOver={isOverTrash} />
    </div>
  )
}
