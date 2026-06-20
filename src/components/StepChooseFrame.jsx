import { useEffect, useRef } from 'react'
import { useOrderStore } from '../store/useOrderStore.js'
import { SKUS, hasOrientationToggle } from '../config/skus.js'
import { peso } from '../config/app.js'

// Always-shown identity glyph (brand-coloured dot grid matching the SKU's own
// shape) — separate from the real photo, which lives on the right side of the
// tile. Both are shown together per the 2026-06-21 tile mockup.
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

// Landscape tile: text column on the left, real photo on the right. Selected
// photo bleeds flush to the card's own rounded edge (no gap, no radius of its
// own — it's clipped by the card's overflow-hidden + rounded-2xl); unselected
// photo is a smaller inset thumbnail with its own margin + rounded corners.
function SkuTile({ sku, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(sku.id)}
      aria-pressed={selected}
      className={[
        'relative flex h-32 w-full overflow-hidden rounded-2xl bg-card text-left transition',
        selected ? 'ring-2 ring-selected shadow-card' : 'ring-1 ring-line hover:ring-rail',
      ].join(' ')}
    >
      {sku.hero && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-selected px-2 py-0.5 font-mono text-[11px] text-white">
          Popular
        </span>
      )}

      <div className="z-10 flex w-[46%] shrink-0 flex-col justify-between p-3">
        <span className="text-selected">
          <MiniGrid cols={sku.base.cols} rows={sku.base.rows} />
        </span>
        <span>
          <span className="block font-display text-base leading-tight text-ink">{sku.name}</span>
          <span className="label-mono">
            {sku.slots} {sku.slots > 1 ? 'photos' : 'photo'}
          </span>
        </span>
        <span className="font-mono text-sm text-ink-sec">{peso(sku.price)}</span>
      </div>

      {sku.photo && (
        // Selected = full-bleed (clipped flush by the card's own rounded-2xl +
        // overflow-hidden); unselected = a smaller inset thumbnail with its own
        // margin + tighter corners. Both states are expressed as real, shared
        // CSS properties (not a Tailwind class swap) so `transition-all` can
        // morph between them smoothly instead of snapping.
        <img
          src={sku.photo}
          alt={sku.name}
          className="absolute object-cover transition-all duration-300 ease-out"
          style={
            selected
              ? {
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: '56%',
                  height: '100%',
                  borderRadius: 0,
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0)',
                }
              : {
                  top: '0.75rem',
                  bottom: '0.75rem',
                  right: '0.75rem',
                  width: '46%',
                  height: 'calc(100% - 1.5rem)',
                  borderRadius: '0.75rem',
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                }
          }
        />
      )}
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
  const sku = SKUS.find((s) => s.id === skuId)

  const scrollRef = useRef(null)
  const cardRefs = useRef({})
  const settleTimer = useRef(null)
  const centeredOnce = useRef(false)
  const rafPending = useRef(false)
  const isMobile = useRef(true)

  // Live "dial" feel (mobile only): as you drag, the centered card stays
  // full-size/opaque and neighbors shrink + dim in real time, tracking scroll
  // position every frame rather than waiting for the settle debounce below.
  // Imperative DOM writes (not React state) so this never re-renders on scroll.
  const applyCardTransforms = () => {
    const container = scrollRef.current
    if (!container || !isMobile.current) return
    const center = container.scrollLeft + container.clientWidth / 2
    const half = container.clientWidth / 2 || 1
    for (const s of SKUS) {
      const el = cardRefs.current[s.id]
      if (!el) continue
      const cardCenter = el.offsetLeft + el.offsetWidth / 2
      const t = Math.min(1, Math.abs(cardCenter - center) / half)
      const scale = 1 - t * 0.12
      const opacity = 1 - t * 0.55
      el.style.transform = `scale(${scale})`
      el.style.opacity = opacity
    }
  }

  const resetCardTransforms = () => {
    for (const s of SKUS) {
      const el = cardRefs.current[s.id]
      if (!el) continue
      el.style.transform = ''
      el.style.opacity = ''
    }
  }

  // Track the sm: breakpoint so the live transform only ever runs on the
  // mobile carousel — on desktop's wrapping grid every card stays full-size.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const sync = () => {
      isMobile.current = !mq.matches
      if (!isMobile.current) resetCardTransforms()
      else applyCardTransforms()
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mobile "dial": center the currently-selected card on first mount (starts
  // on Classic, the store default) without animating the page load.
  useEffect(() => {
    if (centeredOnce.current) return
    const el = cardRefs.current[skuId]
    if (el) {
      el.scrollIntoView({ inline: 'center', block: 'nearest' })
      centeredOnce.current = true
      requestAnimationFrame(applyCardTransforms)
    }
  }, [skuId])

  // While scrolling: every frame, update scale/opacity live (rAF-throttled so
  // rapid scroll events only schedule one paint each); separately, once
  // scrolling settles for 120ms, whichever card is closest to center becomes
  // selected — tapping a card still also works.
  const handleScroll = () => {
    if (!rafPending.current) {
      rafPending.current = true
      requestAnimationFrame(() => {
        applyCardTransforms()
        rafPending.current = false
      })
    }

    if (settleTimer.current) clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => {
      const container = scrollRef.current
      if (!container) return
      const center = container.scrollLeft + container.clientWidth / 2
      let closestId = null
      let closestDist = Infinity
      for (const s of SKUS) {
        const el = cardRefs.current[s.id]
        if (!el) continue
        const cardCenter = el.offsetLeft + el.offsetWidth / 2
        const dist = Math.abs(cardCenter - center)
        if (dist < closestDist) {
          closestDist = dist
          closestId = s.id
        }
      }
      if (closestId && closestId !== skuId) selectSku(closestId)
    }, 120)
  }

  return (
    <section>
      <p className="label-mono">Step 1</p>
      <h2 className="mt-1 font-display text-2xl text-ink">Choose Frame</h2>
      <p className="mt-2 font-sans text-sm text-ink-muted">Pick a size — the preview updates as you go.</p>

      {/* Mobile: scroll-driven dial — snap-center carousel, no visible
          scrollbar, edge padding so the first/last cards can fully center
          instead of clipping against the screen edge. Desktop: wrapping grid. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-hide mt-5 flex gap-3 overflow-x-auto px-[12%] pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 sm:snap-none"
      >
        {SKUS.map((s) => (
          <div
            key={s.id}
            ref={(el) => {
              if (el) cardRefs.current[s.id] = el
            }}
            className="w-[76%] flex-shrink-0 snap-center transition-[transform,opacity] duration-100 ease-out will-change-transform sm:w-auto sm:!scale-100 sm:!opacity-100"
          >
            <SkuTile sku={s} selected={s.id === skuId} onSelect={selectSku} />
          </div>
        ))}
      </div>

      {hasOrientationToggle(sku) && <OrientationToggle />}

      <p className="mt-6 font-sans text-sm text-ink-muted">
        Tap an empty tile in the live preview to add your photos.
      </p>
    </section>
  )
}
