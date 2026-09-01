/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050507",
        surface: "#0A0A0F",
        card: "#0E0E16",
        cardBorder: "rgba(255, 255, 255, 0.08)",
        razorpayBlue: "#2B7FFF",
        razorpayHover: "#1865F2",
        emeraldStatus: "#00BE6F",
        amberStatus: "#FFB020",
        crimsonStatus: "#FF4757",
        purpleVoice: "#A855F7",
      },
      fontFamily: {
        sans: ["Inter", "Inter Tight", "system-ui", "sans-serif"],
        display: ["TASA Orbiter Display", "Inter Tight", "sans-serif"],
        mono: ["Fragment Mono", "Geist Mono", "monospace"],
      },
      backgroundImage: {
        'thermal-glow': 'radial-gradient(circle at 50% 20%, rgba(43, 127, 255, 0.22) 0%, rgba(0, 190, 111, 0.12) 35%, rgba(5, 5, 7, 0) 70%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'waveform': 'wave 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        wave: {
          '0%': { height: '8px' },
          '100%': { height: '36px' },
        }
      }
    },
  },
  plugins: [],
}
