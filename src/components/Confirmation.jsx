import { BRAND } from '../config/app.js'

export default function Confirmation({ orderId, onReset }) {
  return (
    <section className="flex flex-col items-center py-10 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-white">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      <h2 className="mt-5 font-display text-2xl text-ink">Order placed</h2>
      <p className="mt-2 text-sm text-ink-muted">Keep this order ID — screenshot it.</p>
      <p className="mt-4 rounded-xl bg-sage px-5 py-3 font-mono text-xl tracking-wide text-ink ring-1 ring-line">
        {orderId}
      </p>

      <p className="mt-5 max-w-sm text-sm text-ink-muted">
        This is a preview build — no email or payment has been sent yet. Once the backend is wired,
        you'll get a confirmation with GCash payment instructions.
      </p>

      <p className="mt-6 font-display text-lg text-ink-sec">{BRAND.tagline}.</p>

      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-xl px-5 py-3 font-mono text-xs uppercase tracking-wider text-ink-sec ring-1 ring-line transition hover:text-ink hover:ring-rail"
      >
        Start another
      </button>
    </section>
  )
}
