import type { MouseEvent } from 'react'
import type { Note } from './types'

interface StickyNoteProps {
  note: Note
  onMoveStart: (e: MouseEvent, noteId: string) => void
  onResizeStart: (e: MouseEvent, noteId: string) => void
  onContentChange: (noteId: string, content: string) => void
  onContentBlur: (noteId: string) => void
}

export default function StickyNote({ note, onMoveStart, onResizeStart, onContentChange, onContentBlur }: StickyNoteProps) {
  return (
    <div
      className="note"
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        backgroundColor: note.color,
      }}
    >
      <div
        className="note-header"
        onMouseDown={(e) => onMoveStart(e, note.id)}
      />
      <textarea
        className="note-content"
        value={note.content}
        placeholder="Type your note..."
        onChange={(e) => onContentChange(note.id, e.target.value)}
        onBlur={() => onContentBlur(note.id)}
      />
      <div
        className="resize-handle"
        onMouseDown={(e) => onResizeStart(e, note.id)}
      />
    </div>
  )
}
