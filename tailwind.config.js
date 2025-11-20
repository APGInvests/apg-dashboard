/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0066FF',
        'primary-dark': '#0052CC',
        'navy': '#1A2B4A',
        'blue-light': '#4A90E2',
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#F59E0B',
      },
    },
  },
  plugins: [],
}
