// SariSari Snaps — SKU catalogue (brief §3). Single source of truth.
// Cells render SQUARE (physical cells are 52×52mm). Grids are cols × rows in the
// HORIZONTAL orientation. Default orientation is horizontal everywhere.
//
// orientation field:
//   'none'        → symmetric grid, no orientation control (Solo, Classic, Gridstagram)
//   'toggle'      → vertical / horizontal allowed (Double Take, Triple Treat, Six Pack)
//   'horizontal'  → fixed horizontal/wide only, no control (Wide Shot, Eight Tiles, Darling Dozen)
//
// NOTE: Wide Shot (₱988) is intentionally priced ABOVE Classic (₱888) though both
// have 4 slots. That is correct — do not "fix" it.
//
// `photo`: real empty-tray catalog shot per SKU (2026-06-21), `public/sku-photos/`,
// sourced from Photo Library - Web Optimized/10_Catalog-Size_Empty/. Wide Shot has
// no exact 4-in-a-row horizontal shot in the library — using the closest available
// (the 1x4 vertical strip) as an approximation; revisit if a true wide 4-strip shot
// is ever added to the library.

export const SKUS = [
  { id: 'SOLO',          name: 'Solo',          slots: 1,  base: { cols: 1, rows: 1 }, orientation: 'none',       price: 388,  photo: '/sku-photos/solo.jpg',          blurb: 'One photo, all the feeling.' },
  { id: 'DOUBLE TAKE',   name: 'Double Take',   slots: 2,  base: { cols: 2, rows: 1 }, orientation: 'toggle',     price: 588,  photo: '/sku-photos/double-take.jpg',   blurb: 'A pair that belongs together.' },
  { id: 'TRIPLE TREAT',  name: 'Triple Treat',  slots: 3,  base: { cols: 3, rows: 1 }, orientation: 'toggle',     price: 788,  photo: '/sku-photos/triple-treat.jpg',  blurb: 'Three little moments in a row.' },
  { id: 'WIDE SHOT',     name: 'Wide Shot',     slots: 4,  base: { cols: 4, rows: 1 }, orientation: 'horizontal', price: 988,  photo: '/sku-photos/wide-shot.jpg',     blurb: 'A panorama of four.' },
  { id: 'CLASSIC',       name: 'Classic',       slots: 4,  base: { cols: 2, rows: 2 }, orientation: 'none',       price: 888,  photo: '/sku-photos/classic.jpg',       hero: true, blurb: 'The 2×2 keepsake. Most-loved.' },
  { id: 'SIX PACK',      name: 'Six Pack',      slots: 6,  base: { cols: 3, rows: 2 }, orientation: 'toggle',     price: 1288, photo: '/sku-photos/six-pack.jpg',      blurb: 'Half a dozen to hold onto.' },
  { id: 'EIGHT TILES',   name: 'Eight Tiles',   slots: 8,  base: { cols: 4, rows: 2 }, orientation: 'horizontal', price: 1688, photo: '/sku-photos/eight-tiles.jpg',   blurb: 'A wall of eight, in one frame.' },
  { id: 'GRIDSTAGRAM',   name: 'Gridstagram',   slots: 9,  base: { cols: 3, rows: 3 }, orientation: 'none',       price: 1788, photo: '/sku-photos/gridstagram.jpg',   blurb: 'The perfect 3×3 grid.' },
  { id: 'DARLING DOZEN', name: 'Darling Dozen', slots: 12, base: { cols: 4, rows: 3 }, orientation: 'horizontal', price: 2488, photo: '/sku-photos/darling-dozen.jpg', blurb: 'Twelve. The whole story.' },
]

export const DEFAULT_SKU_ID = 'CLASSIC' // hero, pre-selected
export const DEFAULT_ORIENTATION = 'horizontal'

export const skuById = (id) => SKUS.find((s) => s.id === id)

export const hasOrientationToggle = (sku) => sku?.orientation === 'toggle'

// Resolve the live grid for a SKU + orientation. Vertical swaps cols/rows,
// but ONLY for toggle SKUs (e.g. Double Take vertical = 1×2, Six Pack vertical = 2×3).
export function getGrid(sku, orientation = DEFAULT_ORIENTATION) {
  if (!sku) return { cols: 1, rows: 1 }
  const { cols, rows } = sku.base
  if (sku.orientation === 'toggle' && orientation === 'vertical') {
    return { cols: rows, rows: cols }
  }
  return { cols, rows }
}
