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
          DEFAULT: '#1E40AF', // Navy blue
          dark: '#1E3A8A',
          light: '#3B82F6',
        },
        accent: {
          DEFAULT: '#0D9488', // Teal
          dark: '#0F766E',
          light: '#14B8A6',
        },
        danger: {
          DEFAULT: '#DC2626', // Red for cavities
          light: '#EF4444',
        },
        warning: {
          DEFAULT: '#F59E0B', // Yellow for watch areas
          light: '#FBBF24',
        },
        success: {
          DEFAULT: '#10B981', // Green for healthy
          light: '#34D399',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
