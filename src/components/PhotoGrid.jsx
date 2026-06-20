// The photo grid that lives inside the frame preview.
// When every slot is filled and `interactive` is on, the tiles become a
// dnd-kit single-container sortable (the "sandbox"). Reordering is EPHEMERAL —
// it only shuffles the local array and is never sent to the backend.

import { useState } from 'react'
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { readableInk } from '../config/colors.js'

function SortableCell({ photo }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 20 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative aspect-square touch-none select-none overflow-hidden rounded-[7%] ring-1 ring-black/10 cursor-grab active:cursor-grabbing"
    >
      <img
        src={photo.url}
        alt={photo.name}
        draggable={false}
        className="pointer-events-none h-full w-full object-cover"
      />
    </div>
  )
}

function StaticCell({ photo, index, frameHex }) {
  const ink = readableInk(frameHex)
  return (
    <div className="relative aspect-square overflow-hidden rounded-[7%] ring-1 ring-black/10">
      {photo ? (
        <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: `color-mix(in srgb, ${frameHex} 86%, ${ink} 14%)`, color: ink }}
        >
          <span className="font-mono text-[clamp(10px,2.4vw,13px)] opacity-50">
            {index + 1}
          </span>
        </div>
      )}
    </div>
  )
}

export default function PhotoGrid({
  photos,
  cols,
  frameHex,
  interactive = false,
  onReorder,
}) {
  const allFilled = photos.length > 0 && photos.every(Boolean)
  const enableDrag = interactive && allFilled
  const ids = photos.filter(Boolean).map((p) => p.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const [, setDragging] = useState(false)

  const gridStyle = { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }

  const grid = (
    <div className="grid gap-[3.5%]" style={gridStyle}>
      {photos.map((p, i) =>
        enableDrag && p ? (
          <SortableCell key={p.id} photo={p} />
        ) : (
          <StaticCell key={p?.id || `empty-${i}`} photo={p} index={i} frameHex={frameHex} />
        ),
      )}
    </div>
  )

  if (!enableDrag) return grid

  const stopDrag = () => {
    setDragging(false)
    document.body.classList.remove('dragging')
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={() => {
        setDragging(true)
        document.body.classList.add('dragging')
      }}
      onDragCancel={stopDrag}
      onDragEnd={(e) => {
        stopDrag()
        const { active, over } = e
        if (over && active.id !== over.id) {
          const oldIndex = ids.indexOf(active.id)
          const newIndex = ids.indexOf(over.id)
          onReorder?.(arrayMove(ids, oldIndex, newIndex))
        }
      }}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        {grid}
      </SortableContext>
    </DndContext>
  )
}
