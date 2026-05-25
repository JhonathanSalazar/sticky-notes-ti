import { type Dispatch, type MouseEvent, type RefObject, type SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api'
import type { DragState, Note } from '../types'

const NOTE_MIN_W = 120
const NOTE_MIN_H = 80
const NOTE_HEADER_H = 22

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function useNoteInteractions(
  notes: Note[],
  setNotes: Dispatch<SetStateAction<Note[]>>,
  trashRef: RefObject<HTMLDivElement | null>,
) {
  const [isOverTrash, setIsOverTrash] = useState(false)

  // Mirror notes into a ref so mouseup handlers can read current state
  // without stale closure issues (the drag useEffect has [] deps)
  const notesRef = useRef<Note[]>([])
  useEffect(() => { notesRef.current = notes }, [notes])

  const dragRef = useRef<DragState>(null)
  const rafRef = useRef<number | null>(null)

  const onMoveStart = useCallback((e: MouseEvent, noteId: string) => {
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
  }, [setNotes])

  const onResizeStart = useCallback((e: MouseEvent, noteId: string) => {
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
  }, [setNotes])

  useEffect(() => {
    const onMouseMove = (e: globalThis.MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return

      // Throttle updates to one per animation frame for smooth rendering
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const d = dragRef.current
        if (!d) return

        if (d.kind === 'move') {
          const newX = clamp(e.clientX - d.offsetX, 0, window.innerWidth - NOTE_MIN_W)
          const newY = clamp(e.clientY - d.offsetY, 0, window.innerHeight - NOTE_HEADER_H)
          setNotes((prev) =>
            prev.map((n) => (n.id === d.noteId ? { ...n, x: newX, y: newY } : n))
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

        if (d.kind === 'resize') {
          const dx = e.clientX - d.startMouseX
          const dy = e.clientY - d.startMouseY
          const note = notesRef.current.find((n) => n.id === d.noteId)
          setNotes((prev) =>
            prev.map((n) =>
              n.id === d.noteId
                ? {
                    ...n,
                    width: clamp(d.startW + dx, NOTE_MIN_W, window.innerWidth - (note?.x ?? 0)),
                    height: clamp(d.startH + dy, NOTE_MIN_H, window.innerHeight - (note?.y ?? 0)),
                  }
                : n
            )
          )
        }
      })
    }

    const onMouseUp = (e: globalThis.MouseEvent) => {
      const drag = dragRef.current
      if (!drag) return

      const trash = trashRef.current?.getBoundingClientRect()
      const overTrash =
        !!trash &&
        e.clientX >= trash.left &&
        e.clientX <= trash.right &&
        e.clientY >= trash.top &&
        e.clientY <= trash.bottom

      if (drag.kind === 'move') {
        if (overTrash) {
          const deleted = notesRef.current.find((n) => n.id === drag.noteId)
          setNotes((prev) => prev.filter((n) => n.id !== drag.noteId))
          api.remove(drag.noteId).catch(() => {
            if (deleted) setNotes((prev) => [...prev, deleted])
          })
        } else {
          const snapshot = notesRef.current
          const note = snapshot.find((n) => n.id === drag.noteId)
          if (note) api.update(note).catch(() => setNotes(snapshot))
        }
      }

      if (drag.kind === 'resize') {
        const snapshot = notesRef.current
        const note = snapshot.find((n) => n.id === drag.noteId)
        if (note) api.update(note).catch(() => setNotes(snapshot))
      }

      dragRef.current = null
      setIsOverTrash(false)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [setNotes, trashRef])

  return { isOverTrash, notesRef, onMoveStart, onResizeStart }
}
