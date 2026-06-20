// SariSari Snaps — frame colour palette.
// Real hex, locked 2026-06-20 (pulled directly from the photo library's
// color-palette flat-lay reference shot). Colour has NO price impact.

export const FRAME_COLORS = [
  { id: 'white',  label: 'White',  hex: '#FAF8F0' }, // default
  { id: 'black',  label: 'Black',  hex: '#171717' },
  { id: 'red',    label: 'Red',    hex: '#D64045' },
  { id: 'orange', label: 'Orange', hex: '#E8691D' },
  { id: 'yellow', label: 'Yellow', hex: '#F1BE23' },
  { id: 'green',  label: 'Green',  hex: '#4C9A4C' },
  { id: 'blue',   label: 'Blue',   hex: '#3D73A8' },
  { id: 'purple', label: 'Purple', hex: '#7A5CB8' },
  { id: 'pink',   label: 'Pink',   hex: '#D83A7D' },
]

export const DEFAULT_COLOR_ID = 'white'

export const colorById = (id) => FRAME_COLORS.find((c) => c.id === id) || FRAME_COLORS[0]

// Relative luminance per WCAG — shared by readableInk and placeholderOpacity below.
export function relativeLuminance(hex) {
  const c = hex.replace('#', '')
  const toLin = (v) => {
    const s = parseInt(v, 16) / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return (
    0.2126 * toLin(c.slice(0, 2)) +
    0.7152 * toLin(c.slice(2, 4)) +
    0.0722 * toLin(c.slice(4, 6))
  )
}

// Pick a WCAG-AA-friendly ink (dark or light) for text/icon sitting ON a frame colour.
// Threshold tuned for the palette above.
export function readableInk(hex) {
  return relativeLuminance(hex) > 0.42 ? '#241A20' : '#F8EFE5'
}

// The "Your inscription" hint is rendered at reduced opacity over the ink
// colour above. On bright frames (White/Yellow/Orange) the chosen ink is dark,
// and a low alpha over a light background doesn't darken it enough to clear
// WCAG AA — so opacity scales up the brighter the frame gets. Darker/saturated
// frames (where the ink is light) already read fine at the original baseline.
export function placeholderOpacity(hex) {
  const L = relativeLuminance(hex)
  if (L > 0.42) {
    const t = Math.min(1, (L - 0.42) / (1 - 0.42))
    return 0.45 + t * 0.3 // 0.45 → 0.75 as the frame gets brighter
  }
  return 0.35
}
