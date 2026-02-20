import type { ReactNode } from "react";
import { getDocMetadata } from "@/lib/docs/content";
import {
  getDocsNavigation,
  getOpenApiServicesForVersion,
  getServicesForVersion,
  type DocVersion,
  type NavSection,
} from "@/lib/docs/config";
import { DocsChromeClient } from "./docs-chrome-client";

type DocsChromeProps = {
  version: DocVersion;
  children: ReactNode;
};

type TrustSignal = {
  label: string;
  value: string;
};

const toLatestDate = (dates: Array<string | undefined>): string => {
  const validDates = dates.filter((entry): entry is string => Boolean(entry)).sort((a, b) => (a > b ? -1 : 1));
  return validDates[0] ?? "N/A";
};

const buildTrustSignals = (version: DocVersion, sections: NavSection[]): TrustSignal[] => {
  const services = getServicesForVersion(version);
  const openApiServices = getOpenApiServicesForVersion(version);
  const docsMetadata = getDocMetadata(version);
  const latestDocUpdate = toLatestDate(docsMetadata.map((entry) => entry.lastUpdated));

  return [
    { label: "Docs Version", value: version },
    { label: "Coverage", value: `${sections.length} sections` },
    { label: "Services", value: `${services.length} documented` },
    { label: "OpenAPI", value: `${openApiServices.length} interactive` },
    { label: "Last Updated", value: latestDocUpdate },
  ];
};

export function DocsChrome({ version, children }: DocsChromeProps) {
  const sections = getDocsNavigation(version);
  const trustSignals = buildTrustSignals(version, sections);

  return (
    <DocsChromeClient sections={sections} trustSignals={trustSignals} version={version}>
      {children}
    </DocsChromeClient>
  );
}
