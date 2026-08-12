/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6ff',
          100: '#e0edff',
          200: '#bae0ff',
          300: '#7cc4ff',
          400: '#36a3ff',
          500: '#0c82ff',
          600: '#0062e6',
          700: '#004db8',
          800: '#034196',
          900: '#093778',
          950: '#062250',
        },
      },
    },
  },
  plugins: [],
}
