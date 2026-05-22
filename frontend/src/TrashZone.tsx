import { forwardRef } from 'react'

interface TrashZoneProps {
  isOver: boolean
}

const TrashZone = forwardRef<HTMLDivElement, TrashZoneProps>(({ isOver }, ref) => {
  return (
    <div ref={ref} className={`trash-zone ${isOver ? 'trash-zone--active' : ''}`}>
      🗑
    </div>
  )
})

TrashZone.displayName = 'TrashZone'

export default TrashZone
