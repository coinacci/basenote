"use client";

import { useState, useEffect } from "react";

export type ResolvedTheme = "light" | "dark";

function getAutoTheme(): ResolvedTheme {
  const hour = new Date().getHours();
  return hour >= 7 && hour < 21 ? "light" : "dark";
}

export function useTheme() {
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const resolve = () => setResolved(getAutoTheme());
    resolve();
    const interval = setInterval(resolve, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  return { resolved };
}
