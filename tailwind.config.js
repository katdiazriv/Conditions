/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cmg: {
          teal: '#0D9488',
          'teal-dark': '#0B7C71',
          'teal-light': '#14B8A6',
          'teal-lightest': '#D1F5F2',
        },
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
    },
  },
  plugins: [],
};
