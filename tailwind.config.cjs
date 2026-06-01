/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Funnel Sans"', 'sans-serif'],
      },
      colors: {
        gp: {
          midnight:     '#161916',
          fl1:          '#444744',
          fl2:          '#6D706B',
          fl3:          '#ADB1AC',
          coral:        '#FF555F',
          'coral-dark': '#E04050',
          gold:         '#FFAD28',
          white:        '#FFFFFF',
          sunrise:      '#FFFAF4',
          cream:        '#FFF2DF',
        },
      },
      lineHeight: {
        comfortable: '1.65',
      },
    },
  },
  plugins: [],
}
