"use client";

import { useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

function getAutoTheme(): ResolvedTheme {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 21 ? "light" : "dark";
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("basenote_theme") as ThemeMode | null;
    if (saved) setMode(saved);
  }, []);

  useEffect(() => {
    const resolve = () => {
      if (mode === "auto") setResolved(getAutoTheme());
      else setResolved(mode);
    };
    resolve();
    if (mode === "auto") {
      const interval = setInterval(resolve, 60000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem("basenote_theme", newMode);
  };

  return { mode, resolved, setTheme };
}
