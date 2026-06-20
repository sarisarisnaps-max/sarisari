// SariSari Snaps — order configurator (Phase 1: UI on mock data).
import { useState } from 'react'
import { useOrderStore } from './store/useOrderStore.js'
import { BRAND, IS_MOCK } from './config/app.js'
import Stepper from './components/Stepper.jsx'
import StepChooseFrame from './components/StepChooseFrame.jsx'
import StepPickColor from './components/StepPickColor.jsx'
import StepAddDetails from './components/StepAddDetails.jsx'
import StepReview from './components/StepReview.jsx'
import Confirmation from './components/Confirmation.jsx'
import PreviewPanel from './components/PreviewPanel.jsx'

function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
            <svg viewBox="0 0 32 32" className="h-5 w-5">
              <rect x="11.5" y="6.5" width="9" height="4" rx="1.5" fill="currentColor" />
              <rect x="5.5" y="9" width="21" height="15.5" rx="3.2" fill="currentColor" />
              <circle cx="16" cy="16.75" r="4.3" fill="#166534" />
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

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    // Phase 1: mock submit (no backend). Phases 2–3 wire savePhoto + submitOrder.
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 650))
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  const handleReset = () => {
    setSubmitted(false)
    reset()
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1fr_minmax(320px,400px)] lg:py-12">
        {/* Step content */}
        <div className="order-2 lg:order-1">
          {submitted ? (
            <Confirmation orderId={orderId} onReset={handleReset} />
          ) : (
            <>
              <Stepper />
              {step === 1 && <StepChooseFrame />}
              {step === 2 && <StepPickColor />}
              {step === 3 && <StepAddDetails />}
              {step === 4 && <StepReview onSubmit={handleSubmit} submitting={submitting} />}
            </>
          )}
        </div>

        {/* Live preview */}
        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-6">
            <PreviewPanel />
          </div>
        </aside>
      </main>
    </div>
  )
}
