export interface Note {
  id: string
  x: number
  y: number
  width: number
  height: number
  content: string
  color: string
}

export type DragState =
  | { kind: 'move'; noteId: string; offsetX: number; offsetY: number }
  | { kind: 'resize'; noteId: string; startMouseX: number; startMouseY: number; startW: number; startH: number }
  | null
