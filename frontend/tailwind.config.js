/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ═══════════════════════════════════════════════
       * "Eldritch Parchment" Design System v1.1
       * Don't Starve Together × Lovecraftian Sea Horror
       * ═══════════════════════════════════════════════ */

      colors: {
        /* Foundation — Warm dark tones (candlelit ship cabin) */
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

        /* Verdigris & Moss — Weathered copper patina, sea moss */
        verdigris: {
          DEFAULT: '#4A7A6A',
          glow: '#6BA89A',
        },
        moss: {
          dim: '#2A3D2A',
          DEFAULT: '#3A5A3A',
        },
        seaweed: '#5A8A5A',

        /* Faction — Ancient pigment, hand-ground, never neon */
        sailor: {
          DEFAULT: '#4A7A8C',
          glow: '#6BA3B8',
        },
        pirate: {
          DEFAULT: '#A83B2A',
          glow: '#D14B35',
        },
        cult: {
          DEFAULT: '#6B3FA0',
          glow: '#9B6DD7',
        },

        /* Accent & Utility */
        gold: {
          dim: '#8B7535',
          DEFAULT: '#C9A84C',
        },
        firelight: '#E8A63E',
        ember: '#D4622A',
        blood: '#8B1A1A',
        brine: '#2A4A4A',
        bone: '#C8BFA8',
      },

      fontFamily: {
        display: ['"Pirata One"', 'Georgia', 'serif'],
        heading: ['"Pirata One"', 'Georgia', 'serif'],
        body: ['"Pirata One"', 'Georgia', 'serif'],
        sans: ['"Pirata One"', 'Georgia', 'serif'],
        serif: ['"Pirata One"', 'Georgia', 'serif'],
      },

      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        /* Block large radii — too modern for gothic wood */
      },

      boxShadow: {
        'wood': 'inset 0 1px 0 rgba(212,197,160,0.05), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.6)',
        'parchment': 'inset 0 0 30px rgba(0,0,0,0.3), inset 0 0 60px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.5)',
        'firelight': '0 0 15px rgba(232,166,62,0.15), 0 0 40px rgba(232,166,62,0.08)',
        'eldritch': '0 0 20px rgba(107,63,160,0.25), 0 0 60px rgba(107,63,160,0.1)',
        'verdigris': '0 0 10px rgba(74,122,106,0.2), 0 0 30px rgba(74,122,106,0.08)',
        'deep': '0 8px 32px rgba(0,0,0,0.7)',
      },

      animation: {
        'gun-shake': 'gunShake 0.4s ease-out',
        'muzzle-flash': 'muzzleFlash 0.5s ease-out forwards',
        'ship-bob': 'shipBob 3s ease-in-out infinite',
        'eldritch-pulse': 'eldritchPulse 3s ease-in-out infinite',
        'candle-flicker': 'candleFlicker 2s ease-in-out infinite',
        'dust-drift': 'dustDrift 12s linear infinite',
        'fog-drift': 'fogDrift 20s linear infinite',
      },

      keyframes: {
        gunShake: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '20%': { transform: 'translate(-4px, 3px) rotate(-1deg)' },
          '40%': { transform: 'translate(4px, -2px) rotate(1deg)' },
          '60%': { transform: 'translate(-3px, -2px) rotate(-0.5deg)' },
          '80%': { transform: 'translate(2px, 1px) rotate(0.5deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
        muzzleFlash: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '20%': { opacity: '1', transform: 'scale(1.3)', filter: 'drop-shadow(0 0 20px #E8A63E)' },
          '100%': { opacity: '0', transform: 'scale(1.6)', filter: 'drop-shadow(0 0 40px #D4622A)' },
        },
        shipBob: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-4px) rotate(1.5deg)' },
        },
        eldritchPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(107,63,160,0.25)' },
          '50%': { boxShadow: '0 0 35px rgba(155,109,215,0.35)' },
        },
        candleFlicker: {
          '0%, 100%': { opacity: '1' },
          '25%': { opacity: '0.88' },
          '50%': { opacity: '0.95' },
          '75%': { opacity: '0.85' },
        },
        dustDrift: {
          '0%': { transform: 'translate(-10px, 100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.4' },
          '90%': { opacity: '0.3' },
          '100%': { transform: 'translate(100px, -20px) rotate(180deg)', opacity: '0' },
        },
        fogDrift: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
