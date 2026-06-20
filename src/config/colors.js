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

// Pick a WCAG-AA-friendly ink (dark or light) for text/icon sitting ON a frame colour.
// Relative luminance per WCAG; threshold tuned for the palette above.
export function readableInk(hex) {
  const c = hex.replace('#', '')
  const toLin = (v) => {
    const s = parseInt(v, 16) / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const L =
    0.2126 * toLin(c.slice(0, 2)) +
    0.7152 * toLin(c.slice(2, 4)) +
    0.0722 * toLin(c.slice(4, 6))
  return L > 0.42 ? '#241A20' : '#F8EFE5'
}
