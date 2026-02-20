import type { Metadata } from "next";
import { JetBrains_Mono, Public_Sans } from "next/font/google";
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
    default: "qeetmart Documentation",
    template: "%s | qeetmart Docs",
  },
  description:
    "Production-grade documentation portal for the qeetmart polyglot microservices platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} bg-background text-foreground`}>{children}</body>
    </html>
  );
}
