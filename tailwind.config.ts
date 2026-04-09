import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10212b",
        mist: "#eff6f7",
        sky: "#8dd7cf",
        coral: "#ff8d6c",
        sand: "#fff7ec"
      },
      boxShadow: {
        float: "0 24px 70px rgba(16, 33, 43, 0.12)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 10% 20%, rgba(141, 215, 207, 0.25), transparent 20%), radial-gradient(circle at 80% 10%, rgba(255, 141, 108, 0.18), transparent 20%), linear-gradient(180deg, rgba(239, 246, 247, 0.9), rgba(255, 247, 236, 0.95))"
      }
    }
  },
  plugins: []
};

export default config;
