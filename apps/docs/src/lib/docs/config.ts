import serviceCatalogV1 from "@/data/service-catalog.v1.json";

export const DOC_VERSIONS = ["v1"] as const;
export type DocVersion = (typeof DOC_VERSIONS)[number];
export const DEFAULT_VERSION: DocVersion = DOC_VERSIONS[0];

export const DOC_ENVIRONMENTS = ["local", "staging", "prod"] as const;
export type DocEnvironment = (typeof DOC_ENVIRONMENTS)[number];

export type ServiceMetadata = {
  id: string;
  title: string;
  runtime: string;
  owner: string;
  port: number;
  openapi: string | null;
  baseUrls: Record<DocEnvironment, string>;
};

export type NavItem = {
  title: string;
  href: string;
  description?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

const SERVICE_CATALOG: Record<DocVersion, ServiceMetadata[]> = {
  v1: serviceCatalogV1 as ServiceMetadata[],
};

export const isValidVersion = (version: string): version is DocVersion => {
  return DOC_VERSIONS.includes(version as DocVersion);
};

export const normalizeVersion = (version?: string): DocVersion => {
  if (version && isValidVersion(version)) {
    return version;
  }
  return DEFAULT_VERSION;
};

export const getServicesForVersion = (version: DocVersion): ServiceMetadata[] => {
  return SERVICE_CATALOG[version] ?? [];
};

export const getOpenApiServicesForVersion = (version: DocVersion): ServiceMetadata[] => {
  return getServicesForVersion(version).filter((service) => Boolean(service.openapi));
};

export const getDocsNavigation = (version: DocVersion): NavSection[] => {
  return [
    {
      title: "Getting Started",
      items: [
        {
          title: "15-Minute Quickstart",
          href: `/docs/${version}/getting-started/quickstart`,
          description: "Primary onboarding path for new engineers",
        },
        {
          title: "Prerequisites",
          href: `/docs/${version}/getting-started/prerequisites`,
        },
        {
          title: "Local Workflow",
          href: `/docs/${version}/getting-started/local-workflow`,
        },
      ],
    },
    {
      title: "Architecture",
      items: [
        {
          title: "System Overview",
          href: `/docs/${version}/architecture/system-overview`,
        },
        {
          title: "Service Dependencies",
          href: `/docs/${version}/architecture/service-dependencies`,
        },
      ],
    },
    {
      title: "Services",
      items: [
        {
          title: "Service Catalog",
          href: `/docs/${version}/services/overview`,
        },
        {
          title: "API Gateway README",
          href: `/docs/${version}/services/readmes/api-gateway`,
        },
        {
          title: "Auth Service README",
          href: `/docs/${version}/services/readmes/auth-service`,
        },
        {
          title: "User Service README",
          href: `/docs/${version}/services/readmes/user-service`,
        },
        {
          title: "Product Service README",
          href: `/docs/${version}/services/readmes/product-service`,
        },
        {
          title: "Inventory Service README",
          href: `/docs/${version}/services/readmes/inventory-service`,
        },
      ],
    },
    {
      title: "API Reference",
      items: [
        {
          title: "API Home",
          href: `/reference/${version}`,
        },
        ...getOpenApiServicesForVersion(version).map((service) => ({
          title: service.title,
          href: `/reference/${version}/${service.id}`,
        })),
      ],
    },
    {
      title: "Local Development",
      items: [
        {
          title: "Run All Services",
          href: `/docs/${version}/local-development/run-all-services`,
        },
        {
          title: "Docker Workflow",
          href: `/docs/${version}/local-development/docker-workflow`,
        },
      ],
    },
    {
      title: "DevOps",
      items: [
        {
          title: "Deployment",
          href: `/docs/${version}/devops/deployment`,
        },
        {
          title: "GitHub Actions CI/CD",
          href: `/docs/${version}/devops/ci-cd`,
        },
        {
          title: "Environment Matrix",
          href: `/docs/${version}/devops/environment-matrix`,
        },
      ],
    },
    {
      title: "Runbooks",
      items: [
        {
          title: "Common Incidents",
          href: `/docs/${version}/runbooks/common-incidents`,
        },
      ],
    },
    {
      title: "Contributing",
      items: [
        {
          title: "Contribution Guide",
          href: `/docs/${version}/contributing/guide`,
        },
      ],
    },
  ];
};
