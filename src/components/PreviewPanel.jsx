import { useRef, useState } from 'react'
import { useOrderStore } from '../store/useOrderStore.js'
import { skuById, getGrid } from '../config/skus.js'
import { colorById } from '../config/colors.js'
import { IS_MOCK } from '../config/app.js'
import { resizeImage } from '../lib/resize.js'
import { savePhoto } from '../lib/api.js'
import FramePreview from './FramePreview.jsx'

const uid = () =>
  globalThis.crypto?.randomUUID?.() || 'p_' + Math.random().toString(36).slice(2)

// The persistent live preview (sticky on desktop, visible on mobile). Phase 3:
// empty cells are the upload target directly (tap one slot at a time), plus a
// "Mass upload" button for filling several empty slots at once in one go.
export default function PreviewPanel() {
  const skuId = useOrderStore((s) => s.skuId)
  const orientation = useOrderStore((s) => s.orientation)
  const colorId = useOrderStore((s) => s.colorId)
  const photos = useOrderStore((s) => s.photos)
  const engravingText = useOrderStore((s) => s.engravingText)
  const icon = useOrderStore((s) => s.icon)
  const reorderPhotos = useOrderStore((s) => s.reorderPhotos)
  const setPhotoAt = useOrderStore((s) => s.setPhotoAt)
  const setPhotoDriveUrl = useOrderStore((s) => s.setPhotoDriveUrl)
  const orderId = useOrderStore((s) => s.orderId)
  const contactName = useOrderStore((s) => s.contact.name)

  const sku = skuById(skuId)
  const grid = getGrid(sku, orientation)
  const colorHex = colorById(colorId).hex
  const allFilled = photos.length > 0 && photos.every(Boolean)
  const filled = photos.filter(Boolean).length

  const inputRef = useRef(null)
  const massInputRef = useRef(null)
  const targetIndexRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  // Shared by both the single-slot tap upload and the mass-upload button.
  const uploadToSlot = async (index, file) => {
    let url, name, dataUrl
    try {
      const r = await resizeImage(file)
      url = URL.createObjectURL(r.blob)
      dataUrl = r.dataUrl
      name = file.name
    } catch {
      // Resize failed (e.g. unsupported format) — fall back to the original file.
      url = URL.createObjectURL(file)
      dataUrl = null
      name = file.name
    }
    const photo = { id: uid(), url, name, dataUrl, driveUrl: null }
    setPhotoAt(index, photo)

    if (!IS_MOCK && dataUrl) {
      savePhoto({ dataUrl, filename: name, orderId, name: contactName })
        .then((driveUrl) => driveUrl && setPhotoDriveUrl(photo.id, driveUrl))
        .catch((err) => console.error('Photo upload failed:', err))
    }
  }

  const handleEmptyClick = (index) => {
    targetIndexRef.current = index
    inputRef.current?.click()
  }

  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    const index = targetIndexRef.current
    if (!file || index == null) return
    setUploading(true)
    try {
      await uploadToSlot(index, file)
    } finally {
      setUploading(false)
    }
  }

  // Mass upload: fills empty slots in order, one file per slot, re-reading the
  // current slate each iteration so it never double-fills the same slot.
  const onMassFileChange = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const slot = useOrderStore.getState().photos.findIndex((p) => !p)
        if (slot === -1) break
        await uploadToSlot(slot, file)
      }
    } finally {
      setUploading(false)
    }
  }

  const helper = allFilled
    ? 'Drag photos to rearrange — just for fun.'
    : filled > 0
      ? 'Tap an empty tile to add a photo.'
      : 'Tap a tile to add your first photo.'

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
        onEmptyClick={handleEmptyClick}
      />

      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFileChange} />
      <input ref={massInputRef} type="file" accept="image/*" multiple hidden onChange={onMassFileChange} />

      <p className="mt-3 text-center font-mono text-[11px] text-ink-muted">
        {uploading ? 'Adding photo…' : helper}
      </p>

      {!allFilled && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => massInputRef.current?.click()}
            className="rounded-lg bg-card px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink ring-1 ring-line transition hover:ring-rail"
          >
            Mass upload
          </button>
        </div>
      )}
    </div>
  )
}
