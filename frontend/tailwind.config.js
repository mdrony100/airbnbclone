/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        paper: '#FBF8F4',
        ink: '#221E1A',
        muted: '#6E655C',
        line: '#E7DFD4',
        coral: { DEFAULT: '#E96A57', dark: '#D2543F', soft: '#FBEAE5' },
        sand: '#F1E7DA',
        moss: '#2F4A3F',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: { shell: '1360px' },
      borderRadius: { card: '22px', pill: '999px' },
      boxShadow: {
        soft: '0 12px 34px -18px rgba(34,30,26,.28)',
        lift: '0 26px 60px -28px rgba(34,30,26,.42)',
      },
      transitionTimingFunction: { gentle: 'cubic-bezier(.22,.61,.36,1)' },
    },
  },
  plugins: [],
}
