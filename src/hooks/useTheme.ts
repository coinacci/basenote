"use client";

import { useEffect } from "react";

function getAutoDark(): boolean {
  const hour = new Date().getHours();
  return hour < 7 || hour >= 21;
}

export function useTheme() {
  useEffect(() => {
    const apply = () => {
      const dark = getAutoDark();
      document.documentElement.setAttribute("data-theme-dark", dark ? "true" : "false");
    };
    apply();
    const interval = setInterval(apply, 60000);
    return () => clearInterval(interval);
  }, []);
}
