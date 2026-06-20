// SariSari Snaps — frame colour palette.
// ⚠️ PLACEHOLDER hex values (brief Appendix B). Replace this one array once the
// final palette is locked — that's the only edit needed. Colour has NO price impact.

export const FRAME_COLORS = [
  { id: 'white',  label: 'White',  hex: '#FAFAFA' }, // default
  { id: 'black',  label: 'Black',  hex: '#1C1C1C' },
  { id: 'red',    label: 'Red',    hex: '#E5484D' },
  { id: 'orange', label: 'Orange', hex: '#F76B15' },
  { id: 'yellow', label: 'Yellow', hex: '#F5C518' },
  { id: 'green',  label: 'Green',  hex: '#46A758' },
  { id: 'blue',   label: 'Blue',   hex: '#3E63DD' },
  { id: 'purple', label: 'Purple', hex: '#8E4EC6' },
  { id: 'pink',   label: 'Pink',   hex: '#E93D82' },
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
  return L > 0.42 ? '#1a1a1a' : '#FAFAFA'
}
