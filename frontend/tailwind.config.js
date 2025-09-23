/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Acorn Brand Colors
        mint: {
          DEFAULT: '#23DBA7', // Primary mint green
          50: '#E9FBF6', // 10% opacity
          100: '#D3F8ED', // 20% opacity
          200: '#91EDD3', // 50% opacity
        },
        violet: {
          DEFAULT: '#743BFC', // Primary violet
          50: '#F1EBFF', // 10% opacity
          100: '#E3D8FE', // 20% opacity
          200: '#B99DFD', // 50% opacity
        },
        blush: {
          DEFAULT: '#EA5274', // Primary blush
          50: '#FDEDF1', // 10% opacity
          100: '#FBDCE3', // 20% opacity
          200: '#F4A8B9', // 50% opacity
        },
        sunray: {
          DEFAULT: '#FCB01A', // Primary sunray
          50: '#FFF7E8', // 10% opacity
          100: '#FEEFD1', // 20% opacity
          200: '#FDD78C', // 50% opacity
        },
        gunmetal: {
          DEFAULT: '#16252D', // Primary gunmetal
          50: '#E7E9EA', // 10% opacity
          100: '#D0D3D5', // 20% opacity
          200: '#8A9296', // 50% opacity
        },
        white: {
          DEFAULT: '#FBFBFB', // Acorn white
        },
        // Legacy colors for compatibility
        primary: {
          50: '#E9FBF6',
          100: '#D3F8ED',
          200: '#91EDD3',
          300: '#23DBA7',
          400: '#23DBA7',
          500: '#23DBA7',
          600: '#1FA894',
          700: '#1A8F81',
          800: '#15766E',
          900: '#105D5B',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#FFF7E8',
          100: '#FEEFD1',
          200: '#FDD78C',
          300: '#FCB01A',
          400: '#FCB01A',
          500: '#FCB01A',
          600: '#E69E17',
          700: '#D18C14',
          800: '#BC7A11',
          900: '#A7680E',
        },
        danger: {
          50: '#FDEDF1',
          100: '#FBDCE3',
          200: '#F4A8B9',
          300: '#EA5274',
          400: '#EA5274',
          500: '#EA5274',
          600: '#D3486A',
          700: '#BC3E60',
          800: '#A53456',
          900: '#8E2A4C',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        display: ['Signika', 'system-ui', 'sans-serif'],
        emphasis: ['Gochi Hand', 'cursive'],
      },
      borderRadius: {
        'acorn': '40px', // Acorn's standard rounded corners
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
