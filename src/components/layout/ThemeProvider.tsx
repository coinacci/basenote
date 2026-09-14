"use client";

import { useTheme } from "@/hooks/useTheme";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolved } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolved);
  }, [resolved]);

  return <>{children}</>;
}
