/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#f7f1e1',
        treasure: '#d4af37',
        darkmap: '#1e1b16',
        accent: '#ffb347'
      },
      fontFamily: {
        display: ['"Cinzel Decorative"', 'serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'map': '0 4px 10px -2px rgba(0,0,0,0.4), inset 0 0 8px rgba(0,0,0,0.15)'
      }
    },
  },
  plugins: [],
}
