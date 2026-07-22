import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Marca Cashly
        cyan: {
          DEFAULT: "#16C7E8", // cian brillante (fondo principal)
          dark: "#0BB4D6",
        },
        yellow: {
          DEFAULT: "#FFE500", // amarillo intenso (acentos, CTAs)
          dark: "#F5D400",
        },
        navy: {
          DEFAULT: "#071A3A", // azul muy oscuro (superficies oscuras + texto)
          soft: "#0E2A5A",
        },
        slate: {
          DEFAULT: "#4A5578", // texto secundario
        },
      },
      fontFamily: {
        display: ["Fredoka", "system-ui", "sans-serif"],
        sans: ["Nunito", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 8px 24px -12px rgba(7, 26, 58, 0.25)",
        pop: "0 4px 0 0 #071A3A",
      },
    },
  },
  plugins: [],
};

export default config;
