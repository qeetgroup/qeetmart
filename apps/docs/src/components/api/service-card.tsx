import Link from "next/link";
import type { ServiceMetadata } from "@/lib/docs/config";

type ServiceCardProps = {
  service: ServiceMetadata;
  version: string;
};

export function ServiceCard({ service, version }: ServiceCardProps) {
  const href = service.openapi ? `/reference/${version}/${service.id}` : `/docs/${version}/services/overview`;

  return (
    <Link className="service-card" href={href}>
      <span className="service-title">{service.title}</span>
      <span className="service-meta">{service.runtime}</span>
      <div className="service-chip-row">
        <span className="service-chip">Owner: {service.owner}</span>
        <span className="service-chip">Port: {service.port}</span>
        <span className="service-chip">{service.openapi ? "OpenAPI Ready" : "OpenAPI Pending"}</span>
      </div>
    </Link>
  );
}
