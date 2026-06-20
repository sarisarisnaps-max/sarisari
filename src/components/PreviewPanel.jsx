import { useOrderStore } from '../store/useOrderStore.js'
import { skuById, getGrid } from '../config/skus.js'
import { colorById } from '../config/colors.js'
import FramePreview from './FramePreview.jsx'

// The persistent live preview (sticky on desktop, visible on mobile).
export default function PreviewPanel() {
  const skuId = useOrderStore((s) => s.skuId)
  const orientation = useOrderStore((s) => s.orientation)
  const colorId = useOrderStore((s) => s.colorId)
  const photos = useOrderStore((s) => s.photos)
  const engravingText = useOrderStore((s) => s.engravingText)
  const icon = useOrderStore((s) => s.icon)
  const reorderPhotos = useOrderStore((s) => s.reorderPhotos)

  const sku = skuById(skuId)
  const grid = getGrid(sku, orientation)
  const colorHex = colorById(colorId).hex
  const allFilled = photos.length > 0 && photos.every(Boolean)

  return (
    <div className="rounded-2xl bg-sage/60 p-4 ring-1 ring-line">
      <div className="mb-3 flex items-center justify-between">
        <p className="label-mono">Live preview</p>
        <p className="font-mono text-[11px] text-ink-muted">{sku.name}</p>
      </div>

      <FramePreview
        grid={grid}
        colorHex={colorHex}
        photos={photos}
        engraving={engravingText}
        icon={icon}
        interactive
        onReorder={reorderPhotos}
      />

      <p className="mt-3 text-center font-mono text-[11px] text-ink-muted">
        {allFilled ? 'Drag photos to rearrange — just for fun.' : 'Add your photos to see them here.'}
      </p>
    </div>
  )
}
