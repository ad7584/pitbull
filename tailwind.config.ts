import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0A0F",
          900: "#12101A",
          850: "#161326",
          800: "#1A1626",
          700: "#241d33",
          600: "#2f2743",
        },
        piggy: {
          DEFAULT: "#FF4D8D",
          400: "#FF77A8",
          300: "#FFA6C6",
          600: "#E23A76",
        },
        lime: {
          DEFAULT: "#B6FF3C",
          400: "#C8FF6B",
          600: "#98E01E",
        },
        grape: {
          DEFAULT: "#8E67FF",
          400: "#A588FF",
        },
        mint: "#35D399",
        danger: "#F23674",
        paper: "#F5F3FF",
        mute: "#9A93B0",
        faint: "#6B6480",
      },
      fontFamily: {
        display: ['"Clash Display"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "glow-pink": "0 0 0 1px rgba(255,77,141,0.4), 0 8px 40px -6px rgba(255,77,141,0.55)",
        "glow-lime": "0 0 0 1px rgba(182,255,60,0.4), 0 8px 40px -6px rgba(182,255,60,0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 20px 50px -20px rgba(0,0,0,0.8)",
        "inner-top": "0 1px 0 0 rgba(255,255,255,0.08) inset",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "aurora-1": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(6%,-8%,0) scale(1.15)" },
        },
        "aurora-2": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1.1)" },
          "50%": { transform: "translate3d(-8%,6%,0) scale(0.95)" },
        },
        "aurora-3": {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(5%,7%,0) scale(1.2)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        breathe: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(255,77,141,0.0), 0 10px 40px -8px rgba(255,77,141,0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(255,77,141,0.08), 0 14px 50px -6px rgba(255,77,141,0.7)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        wiggle: {
          "0%,100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "aurora-1": "aurora-1 18s ease-in-out infinite",
        "aurora-2": "aurora-2 22s ease-in-out infinite",
        "aurora-3": "aurora-3 26s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        breathe: "breathe 3.4s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        wiggle: "wiggle 0.35s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
