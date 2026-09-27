/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

// Must be require(): importing this file with `import` here stops daisyUI
// from generating any styles.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const daisyThemes = require('daisyui/src/theming/themes');

// Brand purple dark enough for white button text (6.2:1 contrast).
const accent = {
  accent: 'oklch(0.5 0.12 277.023)',
  'accent-content': '#ffffff',
};

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        headings: ['var(--font-poppins)'],
        body: ['var(--font-opensans)'],
      },
      colors: {
        cardBg: 'oklch(90% 0.07 342.55)',
        cardText: 'oklch(20% 0.02 342.55)',
        // Brand text colour; varies with light/dark mode (see globals.css).
        mutedAccent: 'var(--brand-text)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      { light: { ...daisyThemes.light, ...accent } },
      { dark: { ...daisyThemes.dark, ...accent } },
    ],
  },
};
