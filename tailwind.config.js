/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./frontend/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // This enables the class-based dark mode
  theme: {
    extend: {},
  },
  plugins: [],
}
