import { useOrderStore } from '../store/useOrderStore.js'
import { SKUS, skuById, hasOrientationToggle } from '../config/skus.js'
import { peso } from '../config/app.js'
import StepNav from './StepNav.jsx'

// Fallback for any SKU missing a real photo — shouldn't happen now that all 9
// have one, but keeps the tile from rendering blank if that ever changes.
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
  const flex = hasOrientationToggle(sku)
  return (
    <button
      type="button"
      onClick={() => onSelect(sku.id)}
      aria-pressed={selected}
      className={[
        'relative flex w-full flex-col items-start gap-3 overflow-visible rounded-xl bg-card p-3 text-left transition',
        selected ? 'ring-2 ring-selected shadow-card' : 'ring-1 ring-line hover:ring-rail',
      ].join(' ')}
    >
      {sku.hero && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-selected px-2 py-0.5 font-mono text-[11px] text-white">
          Popular
        </span>
      )}
      <span className="flex h-12 items-end gap-2">
        {sku.photo ? (
          <img
            src={sku.photo}
            alt={sku.name}
            className={[
              'rounded-lg object-cover ring-1 ring-black/10 transition-all',
              selected ? '-mt-3 h-20 w-20 shadow-frame' : 'h-12 w-12',
            ].join(' ')}
          />
        ) : (
          <span className={selected ? 'text-selected' : 'text-ink-muted'}>
            <MiniGrid cols={sku.base.cols} rows={sku.base.rows} />
          </span>
        )}
        {flex && (
          <span className="rounded-full bg-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-ink-muted ring-1 ring-line">
            flex
          </span>
        )}
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
      <p className="mt-2 font-sans text-sm text-ink-muted">Pick a size — the preview updates as you go.</p>

      {/* Mobile: horizontal snap-scroll with a peek of the next card, so size/price
          stay comparable without a long vertical scroll. Desktop: wrapping grid —
          no scroll-length problem to solve there. */}
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:snap-none">
        {SKUS.map((s) => (
          <div key={s.id} className="w-[42%] min-w-[148px] flex-shrink-0 snap-start sm:w-auto sm:min-w-0">
            <SkuTile sku={s} selected={s.id === skuId} onSelect={selectSku} />
          </div>
        ))}
      </div>

      {hasOrientationToggle(sku) && <OrientationToggle />}

      <p className="mt-6 font-sans text-sm text-ink-muted">
        Tap an empty tile in the live preview to add your photos.
      </p>

      <StepNav
        hideBack
        canContinue={allFilled}
        continueLabel={allFilled ? 'Continue' : `Add ${remaining} more photo${remaining > 1 ? 's' : ''}`}
      />
    </section>
  )
}
