// Additive persistent strip showing the running total — and now (2026-06-21)
// the primary action button too (Next on steps 1-3, Place Order on step 4),
// so the CTA is always reachable without scrolling. Per-step canContinue/label/
// onContinue logic is computed once in App.jsx and passed down here.
import { useEffect, useRef, useState } from 'react'
import { useOrderStore } from '../store/useOrderStore.js'
import { skuById } from '../config/skus.js'
import { peso } from '../config/app.js'

// Cheap insurance against a double-fired click advancing the wizard two steps
// in one tap (root cause unconfirmed — this just closes off the failure mode):
// ignore any click for 300ms after the last one goes through.
const ADVANCE_LOCK_MS = 300

export default function StickyPriceBar({ canContinue = true, continueLabel = 'Next', onContinue }) {
  const skuId = useOrderStore((s) => s.skuId)
  const quantity = useOrderStore((s) => s.quantity)
  const sku = skuById(skuId)
  const total = sku.price * quantity

  const [locked, setLocked] = useState(false)
  const lockTimer = useRef(null)

  useEffect(() => () => clearTimeout(lockTimer.current), [])

  const handleClick = () => {
    if (locked) return
    setLocked(true)
    lockTimer.current = setTimeout(() => setLocked(false), ADVANCE_LOCK_MS)
    onContinue?.()
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-4 py-3 backdrop-blur shadow-[0_-4px_16px_-8px_rgba(36,26,32,0.18)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0 truncate">
          <span className="block truncate font-mono text-xs uppercase tracking-wider text-ink-muted">
            {sku.name}
            {quantity > 1 ? ` ×${quantity}` : ''}
          </span>
          <span className="rounded-md bg-price px-2 py-0.5 font-mono text-sm text-ink">{peso(total)}</span>
        </div>
        <button
          type="button"
          disabled={!canContinue || locked}
          onClick={handleClick}
          className="shrink-0 rounded-xl bg-primary px-5 py-3 font-mono text-xs font-medium uppercase tracking-wider text-white transition enabled:hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  )
}
