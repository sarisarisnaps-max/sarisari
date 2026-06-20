// SariSari Snaps — order configurator. Phases 2–4: real Drive save / Sheet
// write / confirmation email / Mailchimp when VITE_APPS_SCRIPT_URL is set;
// otherwise falls back to the Phase 1 mock submit.
import { useState } from 'react'
import { useOrderStore } from './store/useOrderStore.js'
import { BRAND, IS_MOCK } from './config/app.js'
import { savePhoto, submitOrder } from './lib/api.js'
import Stepper from './components/Stepper.jsx'
import StepChooseFrame from './components/StepChooseFrame.jsx'
import StepPickColor from './components/StepPickColor.jsx'
import StepAddDetails from './components/StepAddDetails.jsx'
import StepReview from './components/StepReview.jsx'
import Confirmation from './components/Confirmation.jsx'
import PreviewPanel from './components/PreviewPanel.jsx'
import StickyPriceBar from './components/StickyPriceBar.jsx'

const validEmail = (e) => /\S+@\S+\.\S+/.test(e)

function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          {/* Logo mark is brand identity, not a CTA — stays Brand Green even
              though the primary action color moved to gold. */}
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
            <svg viewBox="0 0 32 32" className="h-5 w-5">
              <rect x="11.5" y="6.5" width="9" height="4" rx="1.5" fill="currentColor" />
              <rect x="5.5" y="9" width="21" height="15.5" rx="3.2" fill="currentColor" />
              <circle cx="16" cy="16.75" r="4.3" fill="#F8EFE5" />
            </svg>
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg font-semibold text-ink">{BRAND.name}</p>
            <p className="label-mono">{BRAND.tagline}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const step = useOrderStore((s) => s.step)
  const orderId = useOrderStore((s) => s.orderId)
  const reset = useOrderStore((s) => s.reset)
  const next = useOrderStore((s) => s.next)
  const photos = useOrderStore((s) => s.photos)
  const contact = useOrderStore((s) => s.contact)

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      if (IS_MOCK) {
        await new Promise((r) => setTimeout(r, 650))
      } else {
        // Most photos already uploaded in the background at Step 1; this
        // catches any still-pending or failed ones before we submit so the
        // Sheet always gets real Drive links, not local blob URLs.
        const s = useOrderStore.getState()
        await Promise.all(
          s.photos.filter(Boolean).map(async (p) => {
            if (p.driveUrl || !p.dataUrl) return
            try {
              const url = await savePhoto({
                dataUrl: p.dataUrl,
                filename: p.name,
                orderId: s.orderId,
                name: s.contact.name,
              })
              if (url) useOrderStore.getState().setPhotoDriveUrl(p.id, url)
            } catch (err) {
              console.error('Photo upload retry failed:', err)
            }
          }),
        )
        const payload = useOrderStore.getState().buildPayload()
        const result = await submitOrder(payload)
        if (!result?.ok) throw new Error(result?.error || 'Order submit failed')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message || "Something went wrong — please try again, or message us if it keeps happening.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    reset()
  }

  // Per-step primary-action state for the sticky bar (2026-06-21: Next/Place
  // Order now lives there on every step, not in each step's own page content).
  const filled = photos.filter(Boolean).length
  const allFilled = photos.length > 0 && filled === photos.length
  const remaining = photos.length - filled
  const canSubmit = !!(contact.name.trim() && validEmail(contact.email) && contact.mobile.trim() && !submitting)

  const navByStep = {
    1: {
      canContinue: allFilled,
      label: allFilled ? 'Next' : `Add ${remaining} more photo${remaining > 1 ? 's' : ''}`,
      onContinue: next,
    },
    2: { canContinue: true, label: 'Next', onContinue: next },
    3: { canContinue: true, label: 'Next', onContinue: next },
    4: {
      canContinue: canSubmit,
      label: submitting ? 'Placing order…' : 'Place order',
      onContinue: handleSubmit,
    },
  }
  const nav = navByStep[step]

  return (
    <div className="min-h-screen">
      <Header />

      <main className={['mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1fr_minmax(320px,400px)] lg:py-12', submitted ? '' : 'pb-28'].join(' ')}>
        {/* Step content. Mobile shows this FIRST (step nav + heading give a
            first-time visitor context before they ever see the preview) —
            desktop keeps the preview as the visually-first right-hand column
            via lg:order, unaffected by this. */}
        <div className="order-1 lg:order-1">
          {submitted ? (
            <Confirmation orderId={orderId} onReset={handleReset} />
          ) : (
            <>
              <Stepper />
              {step === 1 && <StepChooseFrame />}
              {step === 2 && <StepPickColor />}
              {step === 3 && <StepAddDetails />}
              {step === 4 && <StepReview submitting={submitting} error={error} />}
            </>
          )}
        </div>

        {/* Live preview */}
        <aside className="order-2 lg:order-2">
          <div className="lg:sticky lg:top-6">
            <PreviewPanel />
          </div>
        </aside>
      </main>

      {!submitted && (
        <StickyPriceBar canContinue={nav.canContinue} continueLabel={nav.label} onContinue={nav.onContinue} />
      )}
    </div>
  )
}
