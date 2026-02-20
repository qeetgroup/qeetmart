import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { DocsChrome } from "@/components/layout/docs-chrome";
import { isValidVersion } from "@/lib/docs/config";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ version: string }>;
};

export default async function DocsVersionLayout({ children, params }: LayoutProps) {
  const { version } = await params;

  if (!isValidVersion(version)) {
    notFound();
  }

  return <DocsChrome version={version}>{children}</DocsChrome>;
}
