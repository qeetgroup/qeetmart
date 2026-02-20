import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BreadcrumbStructuredData } from "@/components/common/breadcrumb-structured-data";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageTransition } from "@/components/common/page-transition";
import { buildCanonicalUrl } from "@/lib/utils";
import "./globals.css";

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "QeetMart | Enterprise Storefront",
    template: "%s | QeetMart",
  },
  description:
    "Production-grade eCommerce storefront built with Next.js App Router, React Query and Zustand.",
  alternates: {
    canonical: buildCanonicalUrl("/"),
  },
  openGraph: {
    title: "QeetMart",
    description:
      "Production storefront architecture with advanced PLP, PDP, cart and checkout experience.",
    url: buildCanonicalUrl("/"),
    siteName: "QeetMart",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  applicationName: "QeetMart",
  appleWebApp: {
    capable: true,
    title: "QeetMart",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f5ee7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${headingFont.variable} ${bodyFont.variable} min-h-screen bg-surface-100 text-surface-900 antialiased`}>
        <AppProviders>
          <BreadcrumbStructuredData />
          <SiteHeader />
          <Breadcrumbs />
          <PageTransition>
            <main>{children}</main>
          </PageTransition>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
