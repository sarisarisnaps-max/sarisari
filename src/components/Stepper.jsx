import { useOrderStore } from '../store/useOrderStore.js'

// Exact customer-facing step labels (brief §4). Never "Customization"/"Configuration".
const STEPS = [
  { n: 1, label: 'Choose Frame' },
  { n: 2, label: 'Pick Color' },
  { n: 3, label: 'Add Personal Details' },
  { n: 4, label: 'Review Order' },
]

export default function Stepper() {
  const step = useOrderStore((s) => s.step)
  const setStep = useOrderStore((s) => s.setStep)

  return (
    <nav aria-label="Progress" className="mb-7">
      <ol className="flex items-center">
        {STEPS.map((st, i) => {
          const active = st.n === step
          const done = st.n < step
          return (
            <li key={st.n} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!done}
                onClick={() => done && setStep(st.n)}
                className={['flex items-center gap-2', done ? 'cursor-pointer' : 'cursor-default'].join(' ')}
              >
                <span
                  className={[
                    'grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs transition',
                    active
                      ? 'bg-selected text-white'
                      : done
                        ? 'bg-primary/15 text-primary'
                        : 'bg-card text-ink-muted ring-1 ring-line',
                  ].join(' ')}
                >
                  {done ? '✓' : st.n}
                </span>
                <span
                  className={[
                    'hidden whitespace-nowrap text-xs md:block',
                    active ? 'text-ink' : 'text-ink-muted',
                  ].join(' ')}
                >
                  {st.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span className={['mx-2 h-px flex-1', done ? 'bg-primary/40' : 'bg-line'].join(' ')} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
