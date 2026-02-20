import { notFound } from "next/navigation";
import { ApiReferenceClient } from "@/components/api/api-reference-client";
import { DocsArticle } from "@/components/layout/docs-article";
import {
  DOC_VERSIONS,
  DOC_ENVIRONMENTS,
  getOpenApiServicesForVersion,
  getServicesForVersion,
  isValidVersion,
  type DocEnvironment,
} from "@/lib/docs/config";
import { getOpenApiSpec } from "@/lib/openapi/specs";

type PageProps = {
  params: Promise<{ version: string; service: string }>;
  searchParams: Promise<{ env?: string }>;
};

export const dynamicParams = false;

export const generateStaticParams = () => {
  return DOC_VERSIONS.flatMap((version) =>
    getOpenApiServicesForVersion(version).map((service) => ({
      version,
      service: service.id,
    })),
  );
};

const normalizeEnvironment = (value?: string): DocEnvironment => {
  if (value && DOC_ENVIRONMENTS.includes(value as DocEnvironment)) {
    return value as DocEnvironment;
  }
  return "local";
};

export default async function ApiReferenceServicePage({ params, searchParams }: PageProps) {
  const { version, service } = await params;
  const query = await searchParams;

  if (!isValidVersion(version)) {
    notFound();
  }

  const metadata = getServicesForVersion(version).find((entry) => entry.id === service);
  if (!metadata || !metadata.openapi) {
    notFound();
  }

  const spec = getOpenApiSpec(version, service);
  if (!spec || typeof spec !== "object") {
    notFound();
  }

  const env = normalizeEnvironment(query.env);
  const selectedBaseUrl = metadata.baseUrls[env];

  const enrichedSpec = {
    ...(spec as Record<string, unknown>),
    servers: [{ url: selectedBaseUrl, description: `${env} base URL` }],
  };

  return (
    <DocsArticle
      contentClassName="space-y-4"
      description={`Runtime: ${metadata.runtime}. Owner: ${metadata.owner}. Base URL (${env}): ${selectedBaseUrl}`}
      prose={false}
      title={metadata.title}
    >
      <p className="mb-4 rounded-md border border-border bg-muted px-3 py-2 text-sm leading-6 text-muted-foreground">
        Runtime: <strong className="text-foreground">{metadata.runtime}</strong> · Owner:{" "}
        <strong className="text-foreground">{metadata.owner}</strong> · Environment:{" "}
        <strong className="text-foreground">{env}</strong> · Base URL:{" "}
        <code className="break-all rounded bg-card px-1.5 py-0.5 text-xs text-foreground">{selectedBaseUrl}</code>
      </p>
      <ApiReferenceClient spec={enrichedSpec} />
    </DocsArticle>
  );
}
