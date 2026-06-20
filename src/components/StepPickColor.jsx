import { useOrderStore } from '../store/useOrderStore.js'
import { FRAME_COLORS } from '../config/colors.js'
import StepNav from './StepNav.jsx'

export default function StepPickColor() {
  const colorId = useOrderStore((s) => s.colorId)
  const selectColor = useOrderStore((s) => s.selectColor)

  return (
    <section>
      <p className="label-mono">Step 2</p>
      <h2 className="mt-1 font-display text-2xl text-ink">Pick Color</h2>
      <p className="mt-2 font-sans text-sm text-ink-muted">Choose your frame colour — the preview updates live.</p>

      {/* Material-chip swatches: the colour fills the whole chip (not a circle
          floating in a box), and the selected indicator uses the dedicated
          Selection colour for the ring + check badge — a white ring/dot would
          be invisible on the white swatch itself, so it has to be a colour
          that reads on every chip in the set. */}
      <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
        {FRAME_COLORS.map((c) => {
          const selected = c.id === colorId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => selectColor(c.id)}
              aria-pressed={selected}
              className="group flex flex-col items-center gap-2"
            >
              <span className="relative block">
                {selected && (
                  <span aria-hidden className="absolute -inset-1.5 rounded-[14px] ring-2 ring-selected" />
                )}
                <span
                  className="block h-12 w-12 rounded-lg shadow-card ring-1 ring-black/10 transition group-hover:shadow-frame"
                  style={{ background: c.hex }}
                />
                {selected && (
                  <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-selected ring-2 ring-page">
                    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8.5l3.2 3.2L13 4.5" />
                    </svg>
                  </span>
                )}
              </span>
              <span className={['font-mono text-[11px]', selected ? 'font-medium text-ink' : 'text-ink-muted'].join(' ')}>
                {c.label}
              </span>
            </button>
          )
        })}
      </div>

      <StepNav />
    </section>
  )
}
