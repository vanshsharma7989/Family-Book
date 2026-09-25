/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f6ff',
          100: '#e5edff',
          200: '#c4d7ff',
          300: '#9bb8ff',
          400: '#6e92ff',
          500: '#4a6cf7',
          600: '#3a52d6',
          700: '#2e3fac',
          800: '#26338a',
          900: '#212c6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
