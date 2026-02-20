"use client";

import { useEffect, useState } from "react";
import { NativeSelect } from "@/components/ui/select";
import {
  DEFAULT_DOCS_THEME,
  DOCS_THEME_STORAGE_KEY,
  isDocsThemeMode,
  resolveDocsTheme,
  type DocsThemeMode,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

const applyThemeMode = (mode: DocsThemeMode) => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = resolveDocsTheme(mode, prefersDark);
  document.documentElement.setAttribute("data-theme", mode);
  document.documentElement.setAttribute("data-resolved-theme", resolved);
};

const persistThemeMode = (theme: DocsThemeMode) => {
  window.localStorage.setItem(DOCS_THEME_STORAGE_KEY, theme);
};

type ThemeSwitcherProps = {
  className?: string;
};

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [theme, setTheme] = useState<DocsThemeMode>(DEFAULT_DOCS_THEME);

  useEffect(() => {
    const attrTheme = document.documentElement.getAttribute("data-theme");
    const storedTheme = window.localStorage.getItem(DOCS_THEME_STORAGE_KEY);
    const initialTheme = isDocsThemeMode(storedTheme)
      ? storedTheme
      : isDocsThemeMode(attrTheme)
        ? attrTheme
        : DEFAULT_DOCS_THEME;

    setTheme(initialTheme);
    applyThemeMode(initialTheme);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applySystemThemeChange = () => {
      const currentMode = document.documentElement.getAttribute("data-theme");
      if (currentMode !== "system") {
        return;
      }

      document.documentElement.setAttribute(
        "data-resolved-theme",
        mediaQuery.matches ? "dark" : "light",
      );
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== DOCS_THEME_STORAGE_KEY || !isDocsThemeMode(event.newValue)) {
        return;
      }

      setTheme(event.newValue);
      applyThemeMode(event.newValue);
    };

    mediaQuery.addEventListener("change", applySystemThemeChange);
    window.addEventListener("storage", onStorage);
    return () => {
      mediaQuery.removeEventListener("change", applySystemThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <NativeSelect
      className={cn("min-w-32", className)}
      label="Theme"
      onValueChange={(value) => {
        if (!isDocsThemeMode(value)) {
          return;
        }
        setTheme(value);
        applyThemeMode(value);
        persistThemeMode(value);
      }}
      options={[
        { label: "System", value: "system" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
      ]}
      value={theme}
    />
  );
}
