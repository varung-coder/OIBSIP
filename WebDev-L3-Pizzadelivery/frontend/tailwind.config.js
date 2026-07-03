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
        brand: {
          light: '#FFE4E6',
          DEFAULT: '#F43F5E', // rose-500
          dark: '#E11D48', // rose-600
          hover: '#BE123C', // rose-700
        },
        slate: {
          950: '#0B0F19'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 20px 40px -15px rgba(244, 63, 94, 0.25)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backdropBlur: {
        premium: '12px',
      }
    },
  },
  plugins: [],
}
