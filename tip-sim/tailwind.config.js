/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        petroleum: {
          DEFAULT: '#1E4D5C',
          mid: '#2E6E84',
          light: '#9BBDC7',
          bg: '#EEF3F4',
        },
        mustard: {
          DEFAULT: '#C8960A',
          dark: '#854F0B',
          bg: '#FFF8E6',
        },
        cream: {
          DEFAULT: '#FBFAF7',
          mid: '#F5F4F0',
          border: '#E0DED6',
        },
        stone: '#EEF3F4',
        tip: {
          text: '#1A1A18',
          mid: '#6A6858',
          light: '#B0A898',
        },
        'green-tip': '#4CAF7D',
        'green-dark': '#0F6E56',
        'green-bg': '#E1F5EE',
        'red-tip': '#A32D2D',
        'red-bg': '#FCEBEB',
        'red-border': '#F09595',
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      }
    }
  },
  plugins: [],
}
