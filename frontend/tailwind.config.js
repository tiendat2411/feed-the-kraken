/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        abyss: '#0A0A08',
        hull: {
          dark: '#1A1510',
          DEFAULT: '#2A2118',
          light: '#3D3228',
        },
        parchment: {
          dim: '#9B8E72',
          DEFAULT: '#D4C5A0',
          bright: '#F0E6CC',
        },
        verdigris: {
          dim: '#33554A',
          DEFAULT: '#4A7A6A',
          glow: '#6BA89A',
        },
        moss: {
          dim: '#2A3D2A',
          DEFAULT: '#3A5A3A',
        },
        seaweed: '#5A8A5A',
        sailor: {
          dim: '#325360',
          DEFAULT: '#4A7A8C',
          glow: '#6BA3B8',
        },
        pirate: {
          dim: '#75291D',
          DEFAULT: '#A83B2A',
          glow: '#D14B35',
        },
        cult: {
          dim: '#482A6C',
          DEFAULT: '#6B3FA0',
          glow: '#9B6DD7',
        },
        gold: {
          dim: '#8B7535',
          DEFAULT: '#C9A84C',
          bright: '#E5C158',
        },
        firelight: {
          dim: '#9E6C20',
          DEFAULT: '#E8A63E',
          glow: '#FFBA49',
        },
        ember: '#D4622A',
        blood: '#8B1A1A',
        brine: '#2A4A4A',
        bone: '#C8BFA8',
      },
      fontFamily: {
        display: ['"Pirata One"', 'Georgia', 'serif'],
        heading: ['"Cinzel"', '"Times New Roman"', 'serif'],
        body: ['"Outfit"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        'firelight': '0 0 15px rgba(232, 166, 62, 0.2), 0 0 35px rgba(232, 166, 62, 0.08)',
        'firelight-lg': '0 0 25px rgba(232, 166, 62, 0.3), 0 0 60px rgba(232, 166, 62, 0.12)',
        'eldritch': '0 0 20px rgba(107, 63, 160, 0.3), 0 0 50px rgba(107, 63, 160, 0.15)',
        'verdigris': '0 0 12px rgba(74, 122, 106, 0.25), 0 0 30px rgba(74, 122, 106, 0.1)',
        'wood-panel': 'inset 0 1px 0 rgba(212, 197, 160, 0.08), inset 0 -2px 4px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.7)',
        'parchment-card': 'inset 0 0 30px rgba(0, 0, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
