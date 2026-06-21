// The live preview — the conversion driver. Renders the real product:
// the selected SKU's grid (chosen orientation, square cells), photos in slots,
// the frame in the customer's chosen colour, and the bottom base strip with the
// inscription (left-anchored) + icon (right-anchored, small right inset ~3mm).
// The frame render uses the CUSTOMER's colour — never the mint UI accent.
//
// 2026-06-21: margins/gap/radii are now derived from the real manufacturing
// blueprint (src/config/blueprint.js) instead of uniform approximations.
// See blueprint.js for why this needs a measured pixel scale rather than
// plain CSS percentages.

import { useEffect, useRef, useState } from 'react'
import PhotoGrid from './PhotoGrid.jsx'
import { readableInk, placeholderOpacity } from '../config/colors.js'
import { SCAD, deriveBlueprint } from '../config/blueprint.js'

export default function FramePreview({
  grid,
  colorHex,
  photos,
  engraving = '',
  icon = '',
  interactive = false,
  onReorder,
  onEmptyClick,
}) {
  const ink = readableInk(colorHex)
  const showBaseHint = !engraving && !icon
  // Real-interaction signal for touch devices, which don't get the hover
  // trigger (see .frame-tilt in index.css) — settle once there's something
  // worth looking at, not on tap.
  const allFilled = photos.length > 0 && photos.every(Boolean)

  const bp = deriveBlueprint(grid.cols, grid.rows)

  // Measure this element's own rendered width, then convert every blueprint
  // mm value to real px using one scale factor calibrated against bp.outer_w.
  // Proof this stays self-consistent (no need to also measure height): the
  // grid's cells are aspect-square and sized from the same scale, so
  // rows*cellPx + (rows-1)*gapPx telescopes to exactly bp.pah * scale, and
  // padTop + that + padBottom lands on bp.outer_h * scale automatically.
  const elRef = useRef(null)
  const [widthPx, setWidthPx] = useState(0)
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width
      if (w) setWidthPx(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const scale = widthPx > 0 ? widthPx / bp.outer_w : null
  // Fallback (~5%-of-width-equivalent) keeps the very first paint, before
  // ResizeObserver fires, from flashing unstyled — inline style overrides it
  // the instant a real measurement lands.
  const mmToPx = (mm) => (scale ? scale * mm : undefined)
  const mmFallbackPct = (mm) => `${(mm / bp.outer_w) * 100}%`

  return (
    <div
      ref={elRef}
      className={[
        'frame-tilt w-full shadow-frame ring-1 ring-black/15',
        allFilled ? 'frame-tilt-settled' : '',
      ].join(' ')}
      style={{
        background: colorHex,
        borderRadius: mmToPx(SCAD.outer_corner_r) ?? mmFallbackPct(SCAD.outer_corner_r),
        paddingLeft: mmToPx(SCAD.frame_left) ?? mmFallbackPct(SCAD.frame_left),
        paddingRight: mmToPx(SCAD.frame_right) ?? mmFallbackPct(SCAD.frame_right),
        paddingTop: mmToPx(SCAD.frame_top) ?? mmFallbackPct(SCAD.frame_top),
        paddingBottom: 0,
      }}
    >
      <PhotoGrid
        photos={photos}
        cols={grid.cols}
        rows={grid.rows}
        frameHex={colorHex}
        interactive={interactive}
        onReorder={onReorder}
        onEmptyClick={onEmptyClick}
        gapPx={mmToPx(SCAD.cell_gap)}
      />

      {/* base strip: inscription left, icon right (small right inset).
          Its height IS the frame_bottom margin from the blueprint (16mm vs
          3mm on the other 3 sides) — not extra space on top of a uniform
          margin, matching the real product's asymmetric base strip.
          Inscription is rendered as a real raised/embossed inscription in the
          frame's own colour (matches the physical product), not flat printed
          text — the dual text-shadow fakes a debossed-plastic look on any
          frame colour without needing per-colour tuning. */}
      <div
        className="flex items-center justify-between gap-3"
        style={{
          color: ink,
          minHeight: mmToPx(SCAD.frame_bottom) ?? mmFallbackPct(SCAD.frame_bottom),
          paddingRight: '1mm',
        }}
      >
        <span
          className="min-w-0 flex-1 truncate font-display text-[clamp(11px,2.7vw,18px)] leading-tight"
          style={
            engraving
              ? { textShadow: '0 1px 0 rgba(255,255,255,0.4), 0 -1px 0 rgba(0,0,0,0.3)' }
              : undefined
          }
        >
          {engraving || (
            <span style={{ opacity: showBaseHint ? placeholderOpacity(colorHex) : 1 }}>
              {showBaseHint ? 'Your inscription' : ''}
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
