/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#1a202c',
          800: '#2d3748',
          700: '#4a5568',
          600: '#718096',
          500: '#A0AEC0',
          400: '#CBD5E0',
          300: '#E2E8F0',
          200: '#EDF2F7',
          100: '#F7FAFC'
        },
        mode: {
          dark: '#1A202C'
        }
      }
    }
  },
  plugins: []
}
