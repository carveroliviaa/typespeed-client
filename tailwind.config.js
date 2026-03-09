/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#60a5fa',
        },
        accent: {
          green: '#22c55e',
          red: '#ef4444',
          gold: '#f59e0b',
          orange: '#f97316',
        },
        bg: {
          DEFAULT: '#0f1117',
          card: '#1a1d27',
          hover: '#22263a',
          border: '#2d3148',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'xp-fill': 'xpFill 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59,130,246,0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(59,130,246,0.9)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        xpFill: {
          '0%': { width: '0%' },
        },
      },
    },
  },
  plugins: [],
}
