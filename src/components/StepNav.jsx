import { useOrderStore } from '../store/useOrderStore.js'

export default function StepNav({
  canContinue = true,
  continueLabel = 'Continue',
  onContinue,
  hideBack = false,
}) {
  const back = useOrderStore((s) => s.back)
  const next = useOrderStore((s) => s.next)

  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {!hideBack ? (
        <button
          type="button"
          onClick={back}
          className="rounded-xl px-5 py-3 font-mono text-xs uppercase tracking-wider text-ink-sec ring-1 ring-line transition hover:text-ink hover:ring-rail"
        >
          Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue || next}
        className="rounded-xl bg-primary px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-white transition enabled:hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {continueLabel}
      </button>
    </div>
  )
}
