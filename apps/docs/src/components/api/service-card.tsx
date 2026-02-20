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
      <span>{service.runtime}</span>
      <span>Owner: {service.owner}</span>
      <span>Port: {service.port}</span>
      <span>{service.openapi ? "OpenAPI Available" : "OpenAPI Pending"}</span>
    </Link>
  );
}
