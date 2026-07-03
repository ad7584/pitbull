import type { Config } from "tailwindcss";

/**
 * Professional dark system. Layered near-blacks carry the UI; pink is the ONE
 * accent, used only as signal (primary action, active state, focus, a single
 * key figure). Semantic green/red are desaturated. No neon, no glow, no
 * gradient surfaces — restraint is the brand. (See research brief in-repo.)
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // near-black elevation tiers (Jupiter/marginfi convention)
        ink: {
          950: "#0A0B0D", // page base
          900: "#0E1014", // raised section
          850: "#14161A", // card surface
          800: "#191C21", // elevated / input
          700: "#23262C", // hairline-strong
          600: "#2C3037", // strong border / disabled
        },
        // brand accent — pink. Used sparingly (~5% of surface).
        piggy: {
          DEFAULT: "#FF4D8D",
          400: "#FF6FA1",
          300: "#FFA6C6",
          600: "#E23A76",
        },
        // repurposed to a calm success/positive green (was neon lime)
        lime: {
          DEFAULT: "#79D194",
          400: "#97DEAC",
          600: "#57B978",
        },
        // muted indigo — rarely used
        grape: {
          DEFAULT: "#8A8FF5",
          400: "#A3A7F8",
        },
        mint: "#57C98A", // semantic success
        danger: "#E5687C", // semantic loss (desaturated red)
        amber: "#E0A649", // semantic warning
        paper: "#F3F5F9", // primary text (cool near-white)
        mute: "#9AA1AC", // secondary text
        faint: "#666D77", // tertiary text
      },
      fontFamily: {
        display: ['"Clash Display"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        "8xl": "88rem", // 1408px — content container
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
        // one subtle elevation shadow, reserved for popovers/menus only
        pop: "0 16px 40px -16px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
