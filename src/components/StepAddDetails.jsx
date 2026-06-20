import { useOrderStore } from '../store/useOrderStore.js'
import { ICONS, ICON_NONE } from '../config/icons.js'
import StepNav from './StepNav.jsx'

const MAX_ENGRAVING = 28

export default function StepAddDetails() {
  const engravingText = useOrderStore((s) => s.engravingText)
  const setEngraving = useOrderStore((s) => s.setEngraving)
  const icon = useOrderStore((s) => s.icon)
  const setIcon = useOrderStore((s) => s.setIcon)
  const notes = useOrderStore((s) => s.notes)
  const setNotes = useOrderStore((s) => s.setNotes)

  const glyphBtn = (g, label, selected) => (
    <button
      key={g || 'none'}
      type="button"
      onClick={() => setIcon(g)}
      aria-pressed={selected}
      className={[
        'grid h-11 min-w-[44px] place-items-center rounded-lg px-3 text-lg ring-1 transition',
        selected
          ? 'bg-selected text-white ring-selected'
          : 'bg-card text-ink ring-line hover:ring-rail',
      ].join(' ')}
    >
      {label}
    </button>
  )

  return (
    <section>
      <p className="label-mono">Step 3</p>
      <h2 className="mt-1 font-display text-2xl text-ink">Add Personal Details</h2>
      <p className="mt-2 text-sm text-ink-muted">All optional — a little something to make it yours.</p>

      <div className="mt-6">
        <label htmlFor="engraving" className="label-mono mb-2 block">
          Name or engraving
        </label>
        <input
          id="engraving"
          type="text"
          value={engravingText}
          maxLength={MAX_ENGRAVING}
          onChange={(e) => setEngraving(e.target.value)}
          placeholder="e.g. The Dela Cruz Family"
          className="w-full rounded-xl bg-card px-4 py-3 font-display text-ink outline-none ring-1 ring-rail placeholder:text-ink-muted focus:ring-2 focus:ring-selected"
        />
        <p className="mt-1 text-right font-mono text-[11px] text-ink-muted">
          {engravingText.length}/{MAX_ENGRAVING}
        </p>
      </div>

      <div className="mt-5">
        <p className="label-mono mb-2">Stamp</p>
        <div className="flex flex-wrap gap-2">
          {glyphBtn(ICON_NONE, 'None', icon === ICON_NONE)}
          {ICONS.map((g) => glyphBtn(g, g, icon === g))}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="notes" className="label-mono mb-2 block">
          Notes to the crafter
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything we should know?"
          className="w-full resize-none rounded-xl bg-card px-4 py-3 text-sm text-ink outline-none ring-1 ring-rail placeholder:text-ink-muted focus:ring-2 focus:ring-selected"
        />
      </div>

      <StepNav />
    </section>
  )
}
