import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          violet: "#7C3AED",
          cyan: "#06B6D4",
          indigo: "#4F46E5",
        }
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    }
  },
  plugins: [],
};
export default config;
