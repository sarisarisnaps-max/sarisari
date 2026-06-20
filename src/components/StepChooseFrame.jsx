import { useRef } from 'react'
import { useOrderStore } from '../store/useOrderStore.js'
import { SKUS, skuById, hasOrientationToggle } from '../config/skus.js'
import { peso, IS_MOCK } from '../config/app.js'
import { resizeImage } from '../lib/resize.js'
import { savePhoto } from '../lib/api.js'
import StepNav from './StepNav.jsx'

const uid = () =>
  globalThis.crypto?.randomUUID?.() || 'p_' + Math.random().toString(36).slice(2)

function MiniGrid({ cols, rows }) {
  return (
    <div
      className="inline-grid gap-[2px]"
      style={{
        gridTemplateColumns: `repeat(${cols}, 8px)`,
        gridTemplateRows: `repeat(${rows}, 8px)`,
      }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <span key={i} className="rounded-[1px] bg-current" />
      ))}
    </div>
  )
}

function SkuTile({ sku, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(sku.id)}
      aria-pressed={selected}
      className={[
        'relative flex flex-col items-start gap-3 rounded-xl bg-card p-3 text-left transition',
        selected ? 'ring-2 ring-selected shadow-card' : 'ring-1 ring-line hover:ring-rail',
      ].join(' ')}
    >
      {sku.hero && (
        <span className="absolute right-2 top-2 rounded-full bg-selected px-2 py-0.5 font-mono text-[11px] text-white">
          Popular
        </span>
      )}
      <span className={['flex h-9 items-end', selected ? 'text-selected' : 'text-ink-muted'].join(' ')}>
        <MiniGrid cols={sku.base.cols} rows={sku.base.rows} />
      </span>
      <span className="w-full">
        <span className="block font-display text-base leading-tight text-ink">{sku.name}</span>
        <span className="label-mono">
          {sku.slots} {sku.slots > 1 ? 'photos' : 'photo'}
        </span>
      </span>
      <span className="font-mono text-sm text-ink-sec">{peso(sku.price)}</span>
    </button>
  )
}

function OrientationToggle() {
  const orientation = useOrderStore((s) => s.orientation)
  const setOrientation = useOrderStore((s) => s.setOrientation)
  const opt = (val, label) => (
    <button
      type="button"
      onClick={() => setOrientation(val)}
      className={[
        'rounded-lg px-4 py-2 font-mono text-xs uppercase tracking-wider transition',
        orientation === val ? 'bg-primary text-white' : 'text-ink-sec hover:text-ink',
      ].join(' ')}
    >
      {label}
    </button>
  )
  return (
    <div className="mt-7">
      <p className="label-mono mb-2">Orientation</p>
      <div className="inline-flex rounded-xl bg-soft p-1 ring-1 ring-line">
        {opt('horizontal', 'Horizontal')}
        {opt('vertical', 'Vertical')}
      </div>
    </div>
  )
}

function PhotoUploader() {
  const photos = useOrderStore((s) => s.photos)
  const addPhotos = useOrderStore((s) => s.addPhotos)
  const removePhotoAt = useOrderStore((s) => s.removePhotoAt)
  const setPhotoDriveUrl = useOrderStore((s) => s.setPhotoDriveUrl)
  const orderId = useOrderStore((s) => s.orderId)
  const contactName = useOrderStore((s) => s.contact.name)
  const inputRef = useRef(null)
  const filled = photos.filter(Boolean).length

  // Resize each photo client-side (Phase 2), drop it into its slot, then —
  // unless we're still in mock mode — fire off the Drive upload in the
  // background and merge the returned URL in once it resolves.
  const onFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return

    const resized = await Promise.all(
      files.map(async (f) => {
        try {
          const r = await resizeImage(f)
          return { id: uid(), file: r.blob, url: URL.createObjectURL(r.blob), name: f.name, dataUrl: r.dataUrl }
        } catch {
          // Resize failed (e.g. unsupported format) — fall back to the original file.
          return { id: uid(), file: f, url: URL.createObjectURL(f), name: f.name, dataUrl: null }
        }
      }),
    )
    addPhotos(resized)

    if (IS_MOCK) return
    for (const p of resized) {
      if (!p.dataUrl) continue
      savePhoto({ dataUrl: p.dataUrl, filename: p.name, orderId, name: contactName })
        .then((url) => url && setPhotoDriveUrl(p.id, url))
        .catch((err) => console.error('Photo upload failed:', err))
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center justify-between">
        <p className="label-mono">Your photos</p>
        <p className="font-mono text-xs text-ink-muted">
          {filled} of {photos.length} filled
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {photos.map((p, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-line">
            {p ? (
              <>
                <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhotoAt(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/80 text-sm text-white ring-1 ring-white/30 hover:bg-ink"
                >
                  ×
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                aria-label={`Add photo to slot ${i + 1}`}
                className="flex h-full w-full items-center justify-center bg-soft text-xl text-ink-muted transition hover:text-selected"
              >
                ＋
              </button>
            )}
          </div>
        ))}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-3 rounded-lg bg-card px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink ring-1 ring-line transition hover:ring-rail"
      >
        Add photos
      </button>
    </div>
  )
}

export default function StepChooseFrame() {
  const skuId = useOrderStore((s) => s.skuId)
  const selectSku = useOrderStore((s) => s.selectSku)
  const photos = useOrderStore((s) => s.photos)
  const sku = skuById(skuId)
  const filled = photos.filter(Boolean).length
  const allFilled = photos.length > 0 && filled === photos.length
  const remaining = photos.length - filled

  return (
    <section>
      <p className="label-mono">Step 1</p>
      <h2 className="mt-1 font-display text-2xl text-ink">Choose Frame</h2>
      <p className="mt-2 text-sm text-ink-muted">Pick a size — the preview updates as you go.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SKUS.map((s) => (
          <SkuTile key={s.id} sku={s} selected={s.id === skuId} onSelect={selectSku} />
        ))}
      </div>

      {hasOrientationToggle(sku) && <OrientationToggle />}

      <PhotoUploader />

      <StepNav
        hideBack
        canContinue={allFilled}
        continueLabel={allFilled ? 'Continue' : `Add ${remaining} more photo${remaining > 1 ? 's' : ''}`}
      />
    </section>
  )
}
