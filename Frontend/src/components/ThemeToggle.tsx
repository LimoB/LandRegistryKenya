import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-8 w-8 flex items-center justify-center rounded-lg border border-border/40 bg-card text-text/70 hover:text-text hover:bg-white/5 transition"
    >
      {theme === "dark" ? (
        <Sun size={14} />
      ) : (
        <Moon size={14} />
      )}
    </button>
  );
};

export default ThemeToggle;