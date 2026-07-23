/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        secondary: '#D4AF37',
        'primary-light': '#3B82F6',
        background: '#F5F7FA',
        success: '#22C55E',
        danger: '#DC2626',
      }
    },
  },
  plugins: [],
}