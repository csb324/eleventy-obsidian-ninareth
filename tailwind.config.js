// tailwind.config.js
const colors = require('tailwindcss/colors');

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      ...colors,
      red: {
        50: '#ffeded',
        100: '#edabb1',
        200: '#e06c75',
        300: '#c65656',
        400: '#d04e4e',
        500: '#a53f3f',
        600: '#912e2e',
        700: '#7c2929',
        800: '#571a1a',
        900: '#2f1010',
        DEFAULT: '#912e2e'
      },
      blue: {
        ...colors.blue,
        400: '#61afef',
        500: '#4c78cc'
      }
    },
    extend: {},
  },
  fontFamily: {
    sans: [ 'Inter', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", 'Roboto', 'Helvetica', 'Arial', 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Microsoft YaHei Light", 'sans-serif'],
    serif: ['Calisto MT', 'Palatino Black', 'Book Antiqua', 'Georgia', 'Suez One', 'serif'],
  },
  variants: {},
  plugins: [],
}