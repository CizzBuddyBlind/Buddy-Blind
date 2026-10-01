/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        card: "#141414",
        paper: "#f7f5f2",
        snow: "#ffffff",
        fg: "#f5f5f5",
        mute: "#a0a0a0",
        char: "#1a1a1a",
        ember: "#D4AF37",
        "ember-soft": "#E4C56A",
      },
      fontFamily: {
        sans: ["var(--font-playfair)", "PingFang HK", "PingFang SC", "Noto Sans HK", "Noto Sans SC", "Microsoft JhengHei", "Georgia", "serif"],
        serif: ["var(--font-playfair)", "PingFang HK", "PingFang SC", "Noto Sans HK", "Noto Sans SC", "Microsoft JhengHei", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
