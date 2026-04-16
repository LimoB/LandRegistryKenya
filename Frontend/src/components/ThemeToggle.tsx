import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card text-text hover:opacity-80 transition"
    >
      {theme === "dark" ? (
        <>
          <Sun size={16} />
          Light
        </>
      ) : (
        <>
          <Moon size={16} />
          Dark
        </>
      )}
    </button>
  );
};

export default ThemeToggle;