import { notFound } from "next/navigation";
import { ServiceCard } from "@/components/api/service-card";
import { DOC_VERSIONS, getServicesForVersion, isValidVersion } from "@/lib/docs/config";

type PageProps = {
  params: Promise<{ version: string }>;
};

export const dynamicParams = false;

export const generateStaticParams = () => {
  return DOC_VERSIONS.map((version) => ({ version }));
};

export default async function ApiReferenceIndexPage({ params }: PageProps) {
  const { version } = await params;

  if (!isValidVersion(version)) {
    notFound();
  }

  const services = getServicesForVersion(version);

  return (
    <div className="content-shell">
      <article className="doc-article">
        <header>
          <h1>API Reference</h1>
          <p>Interactive API contracts by service and version, with environment-aware base URLs.</p>
        </header>
        <section className="api-metadata-grid">
          <article className="api-metadata-card">
            <p>How to start</p>
            <strong>Pick a service, add token (if needed), run try-it-out requests.</strong>
          </article>
          <article className="api-metadata-card">
            <p>Environment scope</p>
            <strong>Use top-nav `API Env` to switch local, staging, prod servers.</strong>
          </article>
          <article className="api-metadata-card">
            <p>Contract source</p>
            <strong>Synced from `contracts/openapi/*` via docs build pipeline.</strong>
          </article>
        </section>
        <section className="service-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} version={version} />
          ))}
        </section>
      </article>
    </div>
  );
}
