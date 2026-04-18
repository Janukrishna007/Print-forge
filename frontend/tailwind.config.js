export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0F172A",
        card: "#1E293B",
        accent: "#3B82F6",
        violet: "#8B5CF6",
        ink: "#F8FAFC",
        muted: "#94A3B8",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(59,130,246,0.22)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
};
