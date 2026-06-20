/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Warm Celebrant — order form" LIGHT theme (owner spec, WCAG AA).
        // The rendered FRAME uses the customer's chosen color, never these tokens.
        page: '#FFF7E8', // warm receipt paper (page bg)
        card: '#FFFFFF', // form cards / modals
        soft: '#E9ECE3', // alternate panels
        sage: '#D9E8DC', // section tint
        blush: '#F4D2C3', // soft accent
        line: '#E7E0CE', // card borders (warm hairline)
        rail: '#767C74', // input borders (AA UI, 4.3:1)
        ink: {
          DEFAULT: '#17141F', // primary text (17:1)
          sec: '#4A4D44', // secondary text
          muted: '#5F665D', // helper text (AA, 5.6:1)
        },
        primary: {
          DEFAULT: '#166534', // Kush Green — primary CTA
          hover: '#0F4A28',
        },
        violet: '#4B1E78', // Hotel Violet — secondary CTA
        selected: '#B0186A', // Baddie Magenta — selected / focus
        promo: '#C8F23A', // Neon Lime — promo chip (dark text only)
        price: '#F6B51E', // Manila Mango — price chip (dark text only)
        error: '#B3261E',
        warning: '#8A5200',
        info: '#006181',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        frame: '0 14px 30px -16px rgba(23,20,31,0.4)',
        card: '0 1px 2px rgba(23,20,31,0.06)',
      },
    },
  },
  plugins: [],
}
