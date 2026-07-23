/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./apps/**/*.{js,ts,jsx,tsx,html}",
    "./packages/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ra: {
          bg: '#090909',
          surface: '#141414',
          gold: {
            DEFAULT: '#D4AF37',
            light: '#F3E7C4',
            dark: '#B89742',
          },
          emerald: {
            DEFAULT: '#0F6D5B',
            light: '#148C75',
            dark: '#08483C',
          },
          text: '#F5F5F5',
          muted: '#A3A3A3',
        }
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        amiri: ['Amiri', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
