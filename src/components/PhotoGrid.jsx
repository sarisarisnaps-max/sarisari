// The photo grid that lives inside the frame preview.
// When every slot is filled and `interactive` is on, the tiles become a
// dnd-kit single-container sortable (the "sandbox"). Reordering is EPHEMERAL —
// it only shuffles the local array and is never sent to the backend.
// Empty slots double as the upload target (Phase 3): tap/click one to open the
// file picker for that exact slot — no separate "Add Photos" control needed.

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
import { POCKET_RADIUS_PCT } from '../config/blueprint.js'

// Pocket corner radius (5mm of a 52mm cell) — a plain CSS percentage is
// accurate here with no pixel measurement needed, because every cell is
// forced aspect-square (width === height), so it can't distort into an
// ellipse the way the outer frame's radius would. See blueprint.js.
const cellRadius = { borderRadius: `${POCKET_RADIUS_PCT}%` }

function SortableCell({ photo }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: photo.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 20 : 1,
    ...cellRadius,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative aspect-square touch-none select-none overflow-hidden ring-1 ring-black/10 cursor-grab active:cursor-grabbing"
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

function StaticCell({ photo, index, frameHex, onEmptyClick }) {
  const ink = readableInk(frameHex)

  if (photo) {
    return (
      <div className="relative aspect-square overflow-hidden ring-1 ring-black/10" style={cellRadius}>
        <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
      </div>
    )
  }

  const clickable = !!onEmptyClick

  return (
    <button
      type="button"
      onClick={clickable ? () => onEmptyClick(index) : undefined}
      disabled={!clickable}
      aria-label={`Add photo to slot ${index + 1}`}
      className={[
        'relative flex aspect-square w-full flex-col items-center justify-center gap-0.5 overflow-hidden ring-1 ring-black/10 transition',
        clickable ? 'cursor-pointer hover:brightness-95' : 'cursor-default',
      ].join(' ')}
      style={{ background: `color-mix(in srgb, ${frameHex} 86%, ${ink} 14%)`, color: ink, ...cellRadius }}
    >
      <span className="font-mono text-[clamp(15px,3.4vw,20px)] leading-none opacity-60">+</span>
      <span className="font-mono text-[clamp(9px,2vw,11px)] opacity-40">{index + 1}</span>
    </button>
  )
}

export default function PhotoGrid({
  photos,
  cols,
  rows,
  frameHex,
  interactive = false,
  onReorder,
  onEmptyClick,
  gapPx,
}) {
  const allFilled = photos.length > 0 && photos.every(Boolean)
  const enableDrag = interactive && allFilled
  const ids = photos.filter(Boolean).map((p) => p.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const [, setDragging] = useState(false)

  // gapPx comes from FramePreview's measured-px blueprint scale (real 3mm
  // gap); until that first measurement lands, fall back to the old ~3.5%
  // approximation via Tailwind so nothing flashes to a 0 gap.
  const gridStyle = {
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    ...(gapPx ? { gap: `${gapPx}px` } : {}),
  }

  const grid = (
    <div className={gapPx ? 'grid' : 'grid gap-[3.5%]'} style={gridStyle}>
      {photos.map((p, i) =>
        enableDrag && p ? (
          <SortableCell key={p.id} photo={p} />
        ) : (
          <StaticCell
            key={p?.id || `empty-${i}`}
            photo={p}
            index={i}
            frameHex={frameHex}
            onEmptyClick={interactive ? onEmptyClick : undefined}
          />
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
