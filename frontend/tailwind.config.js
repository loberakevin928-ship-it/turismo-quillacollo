/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#38BDF8',
        secondary: '#BAE6FD',
        'primary-light': '#7DD3FC',
        background: '#F0F9FF',
        success: '#67E8F9',
        danger: '#0B0B0B',
      }
    },
  },
  plugins: [],
}