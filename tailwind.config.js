/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gmp: {
          purple: '#6859A7',
          'purple-50': '#F1EFF8',
          'purple-100': '#DED8EE',
          'purple-200': '#BFB4DE',
          'purple-700': '#4E4180',
          green: '#38B769',
          'green-50': '#E6F7EE',
          'green-700': '#258C4E',
          orange: '#EA8004',
          'orange-50': '#FEF0DF',
          neutral: '#9CA3AF',
        },
        quadrant: {
          quickwin: '#38B769',
          strategic: '#6859A7',
          filler: '#EA8004',
          dontpursue: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        focus: '0 0 0 3px rgba(104, 89, 167, 0.45)',
      },
    },
  },
  plugins: [],
};
