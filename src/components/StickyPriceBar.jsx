// Additive-only persistent strip — does NOT replace the 4-step wizard or its
// Continue/Back gating, just keeps the running total visible (mainly useful
// on mobile, where the live-preview panel isn't sticky like it is on desktop).
import { useOrderStore } from '../store/useOrderStore.js'
import { skuById } from '../config/skus.js'
import { peso } from '../config/app.js'

export default function StickyPriceBar() {
  const skuId = useOrderStore((s) => s.skuId)
  const quantity = useOrderStore((s) => s.quantity)
  const sku = skuById(skuId)
  const total = sku.price * quantity

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-4 py-3 backdrop-blur shadow-[0_-4px_16px_-8px_rgba(36,26,32,0.18)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
          {sku.name}
          {quantity > 1 ? ` ×${quantity}` : ''}
        </span>
        <span className="rounded-md bg-price px-2.5 py-1 font-mono text-sm text-ink">{peso(total)}</span>
      </div>
    </div>
  )
}
