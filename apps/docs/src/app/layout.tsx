import type { Metadata } from "next";
import { JetBrains_Mono, Public_Sans } from "next/font/google";
import { DEFAULT_DOCS_RESOLVED_THEME, DEFAULT_DOCS_THEME, DOCS_THEME_STORAGE_KEY } from "@/lib/theme";
import "swagger-ui-react/swagger-ui.css";
import "./globals.css";

const sans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-doc-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-doc-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://docs.qeetmart.com"),
  title: {
    default: "Qeetmart Documentation",
    template: "%s | Qeetmart Docs",
  },
  description:
    "Production-grade documentation portal for the qeetmart polyglot microservices platform.",
};

const setInitialThemeScript = `
(() => {
  try {
    const key = ${JSON.stringify(DOCS_THEME_STORAGE_KEY)};
    const fallback = ${JSON.stringify(DEFAULT_DOCS_THEME)};
    const value = window.localStorage.getItem(key);
    const theme = value === "light" || value === "dark" || value === "system" ? value : fallback;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-resolved-theme", resolved);
  } catch {
    document.documentElement.setAttribute("data-theme", ${JSON.stringify(DEFAULT_DOCS_THEME)});
    document.documentElement.setAttribute("data-resolved-theme", ${JSON.stringify(DEFAULT_DOCS_RESOLVED_THEME)});
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      data-resolved-theme={DEFAULT_DOCS_RESOLVED_THEME}
      data-theme={DEFAULT_DOCS_THEME}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: setInitialThemeScript }} />
      </head>
      <body className={`${sans.variable} ${mono.variable} bg-background text-foreground`}>{children}</body>
    </html>
  );
}
