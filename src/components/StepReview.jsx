import { useOrderStore } from '../store/useOrderStore.js'
import { skuById } from '../config/skus.js'
import { colorById } from '../config/colors.js'
import { peso } from '../config/app.js'
import StepNav from './StepNav.jsx'

const validEmail = (e) => /\S+@\S+\.\S+/.test(e)

function Field({ id, label, value, onChange, type = 'text', placeholder, optional }) {
  return (
    <div>
      <label htmlFor={id} className="label-mono mb-1.5 block">
        {label} {optional && <span className="text-ink-muted">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-card px-4 py-3 text-sm text-ink outline-none ring-1 ring-rail placeholder:text-ink-muted focus:ring-2 focus:ring-selected"
      />
    </div>
  )
}

export default function StepReview({ onSubmit, submitting, error }) {
  const skuId = useOrderStore((s) => s.skuId)
  const colorId = useOrderStore((s) => s.colorId)
  const quantity = useOrderStore((s) => s.quantity)
  const setQuantity = useOrderStore((s) => s.setQuantity)
  const contact = useOrderStore((s) => s.contact)
  const setContact = useOrderStore((s) => s.setContact)

  const sku = skuById(skuId)
  const unit = sku.price
  const total = unit * quantity
  const color = colorById(colorId)

  const canSubmit =
    contact.name.trim() && validEmail(contact.email) && contact.mobile.trim() && !submitting

  return (
    <section>
      <p className="label-mono">Step 4</p>
      <h2 className="mt-1 font-display text-2xl text-ink">Review Order</h2>
      <p className="mt-2 text-sm text-ink-muted">Set your quantity, add your details, and you're set.</p>

      {/* Quantity */}
      <div className="mt-6 flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-line">
        <span className="label-mono">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity(quantity - 1)}
            aria-label="Decrease quantity"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink ring-1 ring-line hover:ring-rail"
          >
            −
          </button>
          <span className="w-8 text-center font-mono text-base text-ink">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            aria-label="Increase quantity"
            className="grid h-8 w-8 place-items-center rounded-lg text-ink ring-1 ring-line hover:ring-rail"
          >
            +
          </button>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-5 grid gap-3">
        <Field id="c-name" label="Name" value={contact.name} onChange={(v) => setContact('name', v)} placeholder="Maria Santos" />
        <Field id="c-email" label="Email" type="email" value={contact.email} onChange={(v) => setContact('email', v)} placeholder="maria@email.com" />
        <Field id="c-mobile" label="Mobile" type="tel" value={contact.mobile} onChange={(v) => setContact('mobile', v)} placeholder="09xx xxx xxxx" />
        <Field id="c-social" label="Social handle" value={contact.social} onChange={(v) => setContact('social', v)} placeholder="@yourhandle" optional />
      </div>

      {/* Price summary */}
      <dl className="mt-6 space-y-2 rounded-xl bg-soft p-4 ring-1 ring-line">
        <div className="flex items-center justify-between text-sm">
          <dt className="text-ink-sec">Frame — {sku.name}</dt>
          <dd className="font-mono text-ink">{peso(unit)}</dd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <dt className="text-ink-sec">Personalization (engraving + icon)</dt>
          <dd className="font-mono text-ink-muted">{peso(0)}</dd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <dt className="text-ink-sec">Colour — {color.label}</dt>
          <dd className="font-mono text-ink-muted">Free</dd>
        </div>
        <div className="flex items-center justify-between border-t border-line pt-2 text-sm">
          <dt className="text-ink-sec">Quantity</dt>
          <dd className="font-mono text-ink">×{quantity}</dd>
        </div>
        <div className="flex items-center justify-between pt-1">
          <dt className="font-display text-lg text-ink">Total</dt>
          <dd>
            <span className="rounded-md bg-price px-2.5 py-1 font-mono text-base text-ink">{peso(total)}</span>
          </dd>
        </div>
      </dl>

      <StepNav
        canContinue={!!canSubmit}
        onContinue={onSubmit}
        continueLabel={submitting ? 'Placing order…' : 'Place order'}
      />
      {!canSubmit && !submitting && (
        <p className="mt-2 text-center font-mono text-[11px] text-ink-muted">
          Add your name, a valid email, and mobile to place the order.
        </p>
      )}
      {error && (
        <p className="mt-2 text-center font-mono text-[11px] text-error">{error}</p>
      )}
    </section>
  )
}
