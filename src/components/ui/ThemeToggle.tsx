"use client";

import { useTheme, ThemeMode } from "@/hooks/useTheme";
import { useState } from "react";

export function ThemeToggle() {
  const { mode, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const options: { value: ThemeMode; label: string; icon: string }[] = [
    { value: "light", label: "Aydinlik", icon: "☀️" },
    { value: "dark", label: "Karanlik", icon: "🌙" },
    { value: "auto", label: "Otomatik", icon: "🕐" },
  ];

  const current = options.find((o) => o.value === mode) || options[2];

  return (
    <div style={{ position: "relative" }}>
      <button className="theme-toggle-btn" onClick={() => setOpen((o) => !o)} title="Tema sec">
        {current.icon}
      </button>
      {open && (
        <div className="theme-dropdown">
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`theme-option ${mode === opt.value ? "active" : ""}`}
              onClick={() => { setTheme(opt.value); setOpen(false); }}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
              {mode === opt.value && <span className="theme-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
