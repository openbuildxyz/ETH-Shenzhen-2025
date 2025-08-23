/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-blue-light': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'gradient-blue-dark': 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
        'gradient-blue-soft': 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        'gradient-blue-ocean': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      },
    },
  },
  plugins: [],
}
