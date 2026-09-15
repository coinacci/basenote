"use client";

import { useEffect, useState } from "react";

type ColorTheme = "yellow" | "blue" | "red";

export function ThemeSwitcher() {
  const [color, setColor] = useState<ColorTheme>("yellow");

  useEffect(() => {
    const saved = localStorage.getItem("basenote_color") as ColorTheme | null;
    if (saved) {
      setColor(saved);
      document.documentElement.setAttribute("data-theme-color", saved);
    }
  }, []);

  const pick = (c: ColorTheme) => {
    setColor(c);
    localStorage.setItem("basenote_color", c);
    document.documentElement.setAttribute("data-theme-color", c);
  };

  return (
    <div className="theme-dots">
      <div
        className={`theme-dot theme-dot-yellow ${color === "yellow" ? "active" : ""}`}
        onClick={() => pick("yellow")}
        title="Yellow"
      />
      <div
        className={`theme-dot theme-dot-blue ${color === "blue" ? "active" : ""}`}
        onClick={() => pick("blue")}
        title="Blue"
      />
      <div
        className={`theme-dot theme-dot-red ${color === "red" ? "active" : ""}`}
        onClick={() => pick("red")}
        title="Red"
      />
    </div>
  );
}
