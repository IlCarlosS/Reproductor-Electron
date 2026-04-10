/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: 'var(--color-accent)',
        mainBg: 'var(--color-bg)',
        borderBase: 'var(--color-border)',
        muted: 'var(--color-muted)',
        negro: 'var(--color-negro)',
        blanco: 'var(--color-blanco)',
      },
      fontFamily: {
        ubuntu: ['Ubuntu', 'sans-serif'],
      },
    },
  },
  plugins: [],
}