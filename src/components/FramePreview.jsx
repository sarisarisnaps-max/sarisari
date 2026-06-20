// The live preview — the conversion driver. Renders the real product:
// the selected SKU's grid (chosen orientation, square cells), photos in slots,
// the frame in the customer's chosen colour, and the bottom base strip with the
// engraving (left-anchored) + icon (right-anchored, small right inset ~3mm).
// The frame render uses the CUSTOMER's colour — never the mint UI accent.

import PhotoGrid from './PhotoGrid.jsx'
import { readableInk } from '../config/colors.js'

export default function FramePreview({
  grid,
  colorHex,
  photos,
  engraving = '',
  icon = '',
  interactive = false,
  onReorder,
}) {
  const ink = readableInk(colorHex)
  const showBaseHint = !engraving && !icon

  return (
    <div
      className="w-full rounded-[16px] p-[5%] shadow-frame ring-1 ring-black/15"
      style={{ background: colorHex }}
    >
      <PhotoGrid
        photos={photos}
        cols={grid.cols}
        frameHex={colorHex}
        interactive={interactive}
        onReorder={onReorder}
      />

      {/* base strip: engraving left, icon right (small right inset) */}
      <div
        className="mt-[4.5%] flex items-center justify-between gap-3"
        style={{ color: ink, minHeight: '1.7em', paddingRight: '1mm' }}
      >
        <span className="min-w-0 flex-1 truncate font-display text-[clamp(11px,2.7vw,18px)] leading-tight">
          {engraving || (
            <span style={{ opacity: showBaseHint ? 0.35 : 1 }}>
              {showBaseHint ? 'Your engraving' : ''}
            </span>
          )}
        </span>
        <span className="shrink-0 text-[clamp(14px,3.4vw,22px)] leading-none">
          {icon}
        </span>
      </div>
    </div>
  )
}
