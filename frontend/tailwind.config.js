/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0b0b12',
        'bg-secondary': '#0f0f1a',
        card: '#141422',
        'card-hover': '#1a1a2e',
        accent: '#8b5cf6',
        accent2: '#a78bfa',
        'accent-dark': '#7c3aed',
        'accent-light': '#c4b5fd',
        border: 'rgba(255,255,255,0.1)',
        'border-accent': 'rgba(139,92,246,0.3)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        'text-muted': 'rgba(255,255,255,0.7)',
        'text-dimmed': 'rgba(255,255,255,0.5)'
      },
      boxShadow: {
        neon: '0 0 25px rgba(139,92,246,0.35)',
        'neon-strong': '0 0 40px rgba(139,92,246,0.5)',
        'glow': '0 0 15px rgba(139,92,246,0.2)',
        'card': '0 8px 32px rgba(0,0,0,0.3)'
      },
      borderRadius: {
        xl2: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 25px rgba(139,92,246,0.35)' },
          '50%': { boxShadow: '0 0 40px rgba(139,92,246,0.6)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-purple': 'linear-gradient(45deg, rgba(139,92,246,0.1) 0%, rgba(167,139,250,0.05) 50%, rgba(139,92,246,0.1) 100%)'
      }
    }
  },
  plugins: []
}