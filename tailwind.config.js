/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b8dfff',
          300: '#7ec6ff',
          400: '#3da5ff',
          500: '#0080ff', // Vivid corporate blue
          600: '#0066cc',
          700: '#004da3',
          800: '#003370',
          900: '#001a3d',
        }
      }
    },
  },
  plugins: [],
}
