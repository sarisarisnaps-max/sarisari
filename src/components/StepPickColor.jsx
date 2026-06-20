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
      <p className="mt-2 text-sm text-ink-muted">Choose your frame colour — the preview updates live.</p>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {FRAME_COLORS.map((c) => {
          const selected = c.id === colorId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => selectColor(c.id)}
              aria-pressed={selected}
              className={[
                'flex flex-col items-center gap-2 rounded-xl bg-card p-3 transition',
                selected ? 'ring-2 ring-selected shadow-card' : 'ring-1 ring-line hover:ring-rail',
              ].join(' ')}
            >
              <span
                className="h-10 w-10 rounded-full ring-1 ring-black/15"
                style={{ background: c.hex }}
              />
              <span className={['font-mono text-[11px]', selected ? 'text-ink' : 'text-ink-muted'].join(' ')}>
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
