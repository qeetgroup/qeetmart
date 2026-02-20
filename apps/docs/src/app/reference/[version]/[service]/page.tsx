import { notFound } from "next/navigation";
import { ApiReferenceClient } from "@/components/api/api-reference-client";
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
    <article className="doc-article">
      <header>
        <h1>{metadata.title}</h1>
        <p>
          Runtime: {metadata.runtime}. Owner: {metadata.owner}. Base URL ({env}): <code>{selectedBaseUrl}</code>
        </p>
      </header>
      <ApiReferenceClient spec={enrichedSpec} />
    </article>
  );
}
