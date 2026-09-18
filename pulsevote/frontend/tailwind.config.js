/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#FAF8F3',
        'paper-dark': '#181E19',
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          500: '#22c55e',
          700: '#15803d',
          800: '#166534',
          900: '#133522', // Primary dark green button & logo color in image
          950: '#0a1d13',
        },
        charcoal: '#1A1D1A',
        sticky: {
          yellow: '#FEF8D3',
          yellowBorder: '#F0E5A7',
          peach: '#FFE7DB',
          peachBorder: '#F8D0BF',
          mint: '#E2F3E7',
          mintBorder: '#C5E7CD',
        },
        highlight: '#FFE066',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        hand: ['"Caveat"', '"Kalam"', 'cursive'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(22, 40, 28, 0.05)',
        'sticky': '2px 4px 12px rgba(0, 0, 0, 0.08)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
