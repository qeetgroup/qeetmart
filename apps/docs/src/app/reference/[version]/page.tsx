import { notFound } from "next/navigation";
import { ServiceCard } from "@/components/api/service-card";
import { DocsArticle } from "@/components/layout/docs-article";
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
    <DocsArticle
      contentClassName="space-y-4"
      description="Interactive API contracts by service and version."
      prose={false}
      title="API Reference"
    >
      <section className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} version={version} />
        ))}
      </section>
    </DocsArticle>
  );
}
