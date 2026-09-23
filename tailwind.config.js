/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#07090e',
          850: '#0b0f19',
          800: '#0f172a',
          750: '#151e34',
          700: '#1e293b',
          600: '#334155',
        },
        neon: {
          cyan: '#00f0ff',
          pink: '#ff007f',
          purple: '#a855f7',
          green: '#22c55e',
          amber: '#f59e0b',
          rose: '#f43f5e',
          blue: '#3b82f6',
          violet: '#8b5cf6',
          teal: '#14b8a6',
          yellow: '#eab308'
        }
      },
      boxShadow: {
        'neon-cyan': '0 0 15px -2px rgba(0, 240, 255, 0.4), 0 0 30px -5px rgba(0, 240, 255, 0.2)',
        'neon-pink': '0 0 15px -2px rgba(255, 0, 127, 0.4), 0 0 30px -5px rgba(255, 0, 127, 0.2)',
        'neon-purple': '0 0 15px -2px rgba(168, 85, 247, 0.4), 0 0 30px -5px rgba(168, 85, 247, 0.2)',
        'neon-green': '0 0 15px -2px rgba(34, 197, 94, 0.4), 0 0 30px -5px rgba(34, 197, 94, 0.2)',
        'neon-amber': '0 0 15px -2px rgba(245, 158, 11, 0.4), 0 0 30px -5px rgba(245, 158, 11, 0.2)',
        'neon-glow': '0 0 25px rgba(0, 240, 255, 0.25)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(0, 240, 255, 0.7))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.3))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
