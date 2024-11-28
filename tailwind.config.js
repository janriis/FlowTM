/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0F1117',
          lighter: '#1A1D27',
          border: '#2D3343'
        }
      }
    },
  },
  plugins: [],
};