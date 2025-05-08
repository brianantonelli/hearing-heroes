/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4287f5',
        secondary: '#42f5ad',
        accent: '#f542a7',
        'correct': '#4caf50',
        'incorrect': '#f44336',
        'yellow': {
          500: '#F59E0B',
          600: '#D97706',
        },
        'red': {
          600: '#DC2626',
          700: '#B91C1C',
        },
        'blue': {
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'],
      },
      animation: {
        shine: 'shine 2s ease-in-out infinite',
        ping: 'ping 5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(300%)' },
        },
        ping: {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
}