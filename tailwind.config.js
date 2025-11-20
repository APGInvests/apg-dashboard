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
        'cyber-dark': '#0a0e1a',
        'cyber-card': '#1a1f2e',
        'cyber-border': '#2a3342',
        'cyber-cyan': '#00d9ff',
        'cyber-blue': '#0ea5e9',
        'cyber-purple': '#a855f7',
        'cyber-pink': '#ec4899',
        'cyber-green': '#10b981',
        'cyber-teal': '#14b8a6',
        'cyber-orange': '#f97316',
        'cyber-red': '#ef4444',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 217, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundColor: {
        'glass': 'rgba(26, 31, 46, 0.6)',
      },
    },
  },
  plugins: [],
}
