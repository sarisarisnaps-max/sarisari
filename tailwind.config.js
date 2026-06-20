/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Toker Baddie" punchy theme (redesign locked 2026-06-20, supersedes
        // the 2026-06-19 "Warm Celebrant" light spec). The rendered FRAME still
        // uses the customer's chosen color, never these tokens.
        page: '#F8EFE5', // Paper (page bg)
        card: '#FFFFFF', // form cards / modals
        soft: '#EFE6D8', // alternate panels — recomputed from new paper/ink anchors
        sage: '#DCEAE0', // section tint — light tint of Brand Green
        blush: '#F0D9C4', // soft accent
        line: '#E9DDC8', // card borders (warm hairline)
        rail: '#8A7C6C', // input borders (AA UI)
        ink: {
          DEFAULT: '#241A20', // Ink — primary text
          sec: '#4A4039', // secondary text
          muted: '#6B5F54', // helper text
        },
        brand: '#126B42', // Brand Green — logo/wordmark identity ONLY, not a button color
        primary: {
          DEFAULT: '#F0B731', // CTA Honey — primary CTA (replaces kush-green)
          hover: '#D49A1F',
        },
        violet: '#4B1E78', // secondary CTA — carried forward, still complements the new palette
        selected: '#C01C76', // Selection — selected / focus (replaces Baddie Magenta)
        promo: '#C7F04D', // Accent Lime — promo chip (dark text only)
        price: '#F0B731', // consolidated into CTA Honey — was a near-duplicate gold, no reason for two tokens
        error: '#B3261E',
        warning: '#8A5200',
        info: '#006181',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        frame: '0 14px 30px -16px rgba(36,26,32,0.4)',
        card: '0 1px 2px rgba(36,26,32,0.06)',
      },
    },
  },
  plugins: [],
}
