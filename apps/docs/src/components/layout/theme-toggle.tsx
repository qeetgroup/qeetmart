"use client";

import { useEffect, useState } from "react";

type ThemeValue = "system" | "light" | "dark";

const STORAGE_KEY = "qeetmart-theme";

const applyTheme = (value: ThemeValue) => {
  if (value === "system") {
    document.documentElement.removeAttribute("data-theme");
    return;
  }
  document.documentElement.dataset.theme = value;
};

const getInitialTheme = (): ThemeValue => {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // Ignore localStorage failures.
  }
  return "system";
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeValue>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const onChange = (nextTheme: ThemeValue) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Ignore localStorage failures.
    }
  };

  return (
    <label className="select-shell select-shell-theme">
      <span>Theme</span>
      <select aria-label="Select color theme" onChange={(event) => onChange(event.target.value as ThemeValue)} value={theme}>
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
