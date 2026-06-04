/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // NeuroSAN Blue/Light Theme
        'neurosan-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Primary
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'neurosan-slate': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0', // Borders
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Secondary text
          600: '#475569',
          700: '#334155',
          800: '#1e293b', // Primary text
          900: '#0f172a',
        },
        'neurosan-success': {
          500: '#10b981',
          600: '#059669',
        },
        'neurosan-info': {
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
    },
  },
  plugins: [],
}
