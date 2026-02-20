import { notFound } from "next/navigation";
import { ApiReferenceClient, type ApiOperation } from "@/components/api/api-reference-client";
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
  searchParams: Promise<{ env?: string; operation?: string }>;
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

const groupFromPath = (value: string): string => {
  const segment = value.split("/").filter(Boolean)[0];
  if (!segment) {
    return "General";
  }
  return segment.replace(/-/g, " ");
};

const toOperations = (spec: Record<string, unknown>): ApiOperation[] => {
  const paths = spec.paths;
  if (!paths || typeof paths !== "object") {
    return [];
  }

  const operations: ApiOperation[] = [];
  for (const [pathName, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== "object") {
      continue;
    }
    for (const [method, operation] of Object.entries(pathItem as Record<string, unknown>)) {
      if (!["get", "post", "put", "patch", "delete"].includes(method)) {
        continue;
      }
      if (!operation || typeof operation !== "object") {
        continue;
      }
      const op = operation as Record<string, unknown>;
      operations.push({
        method,
        path: pathName,
        summary: String(op.summary ?? "Endpoint"),
        operationId: String(op.operationId ?? `${method}-${pathName}`),
        group: groupFromPath(pathName),
      });
    }
  }

  return operations.sort((a, b) => a.group.localeCompare(b.group) || a.path.localeCompare(b.path));
};

const publicAuthOperations = new Set([
  "get:/actuator/health",
  "post:/auth/register",
  "post:/auth/login",
  "post:/auth/refresh-token",
]);

const withDisplayEnhancements = (
  spec: Record<string, unknown>,
  serviceId: string,
  baseUrl: string,
  env: DocEnvironment,
): Record<string, unknown> => {
  const next = structuredClone(spec);
  const components = (next.components as Record<string, unknown> | undefined) ?? {};
  const securitySchemes = (components.securitySchemes as Record<string, unknown> | undefined) ?? {};
  const schemas = (components.schemas as Record<string, unknown> | undefined) ?? {};

  next.components = {
    ...components,
    securitySchemes: {
      ...securitySchemes,
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ...schemas,
      ApiError: {
        type: "object",
        required: ["code", "message", "traceId"],
        properties: {
          code: { type: "string" },
          message: { type: "string" },
          details: { type: "array", items: { type: "string" } },
          traceId: { type: "string" },
        },
      },
    },
  };

  next.servers = [{ url: baseUrl, description: `${env} base URL` }];

  const paths = next.paths;
  if (paths && typeof paths === "object") {
    for (const [pathName, pathItemRaw] of Object.entries(paths as Record<string, unknown>)) {
      if (!pathItemRaw || typeof pathItemRaw !== "object") {
        continue;
      }

      const pathItem = pathItemRaw as Record<string, unknown>;

      for (const [method, operationRaw] of Object.entries(pathItem)) {
        if (!["get", "post", "put", "patch", "delete"].includes(method)) {
          continue;
        }
        if (!operationRaw || typeof operationRaw !== "object") {
          continue;
        }
        const operation = operationRaw as Record<string, unknown>;
        const isPublicAuthOperation = serviceId === "auth-service" && publicAuthOperations.has(`${method}:${pathName}`);

        if (!isPublicAuthOperation && !operation.security) {
          operation.security = [{ BearerAuth: [] }];
        }

        const responses = (operation.responses as Record<string, unknown> | undefined) ?? {};
        for (const status of ["400", "401", "403", "404", "409", "500"]) {
          const responseRaw = responses[status];
          if (!responseRaw || typeof responseRaw !== "object") {
            continue;
          }
          const response = responseRaw as Record<string, unknown>;
          if (response.content) {
            continue;
          }
          responses[status] = {
            ...response,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiError" },
                example: {
                  code: `${serviceId.replace(/-/g, "_").toUpperCase()}_${status}`,
                  message: String(response.description ?? "Request failed"),
                  details: [],
                  traceId: "trace-local-001",
                },
              },
            },
          };
        }
        operation.responses = responses;
      }
    }
  }

  return next;
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
  const operations = toOperations(spec as Record<string, unknown>);
  const operationFromSearch = typeof query.operation === "string" ? query.operation : undefined;

  const enrichedSpec = withDisplayEnhancements(spec as Record<string, unknown>, service, selectedBaseUrl, env);

  return (
    <div className="content-shell">
      <article className="doc-article">
        <header>
          <h1>{metadata.title}</h1>
          <p>Interactive contract explorer with operation jump list, token injection, and live try-it-out requests.</p>
        </header>
        <section className="api-metadata-grid">
          <article className="api-metadata-card">
            <p>Runtime</p>
            <strong>{metadata.runtime}</strong>
          </article>
          <article className="api-metadata-card">
            <p>Owner Team</p>
            <strong>{metadata.owner}</strong>
          </article>
          <article className="api-metadata-card">
            <p>Base URL ({env})</p>
            <strong>
              <code>{selectedBaseUrl}</code>
            </strong>
          </article>
          <article className="api-metadata-card">
            <p>Operations</p>
            <strong>{operations.length} endpoints</strong>
          </article>
        </section>
        <ApiReferenceClient initialOperation={operationFromSearch} operations={operations} spec={enrichedSpec} />
      </article>
    </div>
  );
}
