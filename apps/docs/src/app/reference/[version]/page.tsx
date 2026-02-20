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
    <article className="doc-article">
      <header>
        <h1>API Reference</h1>
        <p>Interactive API contracts by service and version.</p>
      </header>
      <section className="service-grid">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} version={version} />
        ))}
      </section>
    </article>
  );
}
