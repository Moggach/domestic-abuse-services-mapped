/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

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
        mutedAccent: 'oklch(0.45 0.15 277.023)',       
        mutedAccentOnDark: 'oklch(0.78 0.18 277.023)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['light', 'dark'],
  },
};
