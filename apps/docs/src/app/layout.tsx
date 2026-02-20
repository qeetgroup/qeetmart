import type { Metadata } from "next";
import "swagger-ui-react/swagger-ui.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://docs.qeetmart.com"),
  title: {
    default: "qeetmart Documentation",
    template: "%s | qeetmart Docs",
  },
  description:
    "Production-grade documentation portal for the qeetmart polyglot microservices platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const themeInitScript = `
    (() => {
      try {
        const stored = localStorage.getItem("qeetmart-theme");
        if (stored === "light" || stored === "dark") {
          document.documentElement.dataset.theme = stored;
        }
      } catch {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
