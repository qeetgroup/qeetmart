export const DOCS_THEME_STORAGE_KEY = "qeetmart-docs-theme";

export const DOCS_THEME_OPTIONS = ["system", "light", "dark"] as const;

export type DocsThemeMode = (typeof DOCS_THEME_OPTIONS)[number];
export type DocsResolvedTheme = Exclude<DocsThemeMode, "system">;

export const DEFAULT_DOCS_THEME: DocsThemeMode = "system";
export const DEFAULT_DOCS_RESOLVED_THEME: DocsResolvedTheme = "light";

export const isDocsThemeMode = (value: string | null | undefined): value is DocsThemeMode => {
  if (!value) {
    return false;
  }
  return DOCS_THEME_OPTIONS.includes(value as DocsThemeMode);
};

export const resolveDocsTheme = (mode: DocsThemeMode, prefersDark: boolean): DocsResolvedTheme => {
  if (mode === "system") {
    return prefersDark ? "dark" : "light";
  }
  return mode;
};
