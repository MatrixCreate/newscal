/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.js', '.src/**/*.css', './templates/**/*.html', './src/main.css'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ["winter", "night"]
  }
}

