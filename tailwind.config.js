/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      colors: {
        slate: {
          750: '#334155',
        },
        blue: {
          600: '#1D4ED8',
        },
        red: {
          600: '#EF4444',
        },
        green: {
          600: '#10B981',
        },
      },
    },
  },
  plugins: [],
};