// Back-only now — the primary action (Next / Place Order) lives in the sticky
// bottom bar across all 4 steps (see App.jsx + StickyPriceBar.jsx), always
// reachable without scrolling. Steps that don't need a Back control just omit
// this component entirely.
import { useOrderStore } from '../store/useOrderStore.js'

export default function StepNav() {
  const back = useOrderStore((s) => s.back)

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={back}
        className="rounded-xl px-5 py-3 font-mono text-xs uppercase tracking-wider text-ink-sec ring-1 ring-line transition hover:text-ink hover:ring-rail"
      >
        Back
      </button>
    </div>
  )
}
