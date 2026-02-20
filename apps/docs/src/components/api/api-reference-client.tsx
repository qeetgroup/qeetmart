"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export type ApiOperation = {
  method: string;
  path: string;
  summary: string;
  operationId: string;
  group: string;
};

type ApiReferenceClientProps = {
  spec: object | string;
  operations: ApiOperation[];
  initialOperation?: string;
};

const toHeaderValue = (token: string): string => {
  const value = token.trim();
  if (!value) {
    return "";
  }
  return value.toLowerCase().startsWith("bearer ") ? value : `Bearer ${value}`;
};

const jumpToOperation = (operation: ApiOperation) => {
  const summaries = Array.from(document.querySelectorAll(".opblock-summary"));
  for (const summary of summaries) {
    const method = summary.querySelector(".opblock-summary-method")?.textContent?.trim().toLowerCase() ?? "";
    const path = summary.querySelector(".opblock-summary-path")?.textContent?.trim() ?? "";
    if (method === operation.method.toLowerCase() && path === operation.path) {
      const container = summary.closest(".opblock");
      if (container) {
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        (summary as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
      }
      const trigger = summary.querySelector("button");
      if (trigger) {
        (trigger as HTMLButtonElement).click();
      }
      break;
    }
  }
};

export function ApiReferenceClient({ spec, operations, initialOperation }: ApiReferenceClientProps) {
  const [token, setToken] = useState("");
  const [operationQuery, setOperationQuery] = useState("");

  const groupedOperations = useMemo(() => {
    const groups = new Map<string, ApiOperation[]>();
    for (const operation of operations) {
      const current = groups.get(operation.group) ?? [];
      current.push(operation);
      groups.set(operation.group, current);
    }
    return Array.from(groups.entries()).map(([group, entries]) => ({
      group,
      entries: entries.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method)),
    }));
  }, [operations]);

  useEffect(() => {
    if (!initialOperation) {
      return;
    }

    const target = operations.find((operation) => operation.operationId === initialOperation);
    if (!target) {
      return;
    }

    const timer = setTimeout(() => jumpToOperation(target), 800);
    return () => clearTimeout(timer);
  }, [initialOperation, operations]);

  const filteredOperations = useMemo(() => {
    const query = operationQuery.trim().toLowerCase();
    if (!query) {
      return groupedOperations;
    }
    return groupedOperations
      .map((group) => ({
        ...group,
        entries: group.entries.filter(
          (entry) =>
            entry.path.toLowerCase().includes(query) ||
            entry.summary.toLowerCase().includes(query) ||
            entry.method.toLowerCase().includes(query) ||
            entry.operationId.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.entries.length > 0);
  }, [groupedOperations, operationQuery]);

  return (
    <div className="api-layout">
      <section className="api-toolbar">
        <div className="api-toolbar-row">
          <label htmlFor="api-token">Authorization token</label>
          <input
            className="api-token-input"
            id="api-token"
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste raw JWT or Bearer token"
            type="password"
            value={token}
          />
          <button className="btn" onClick={() => setToken("")} type="button">
            Clear
          </button>
        </div>
        <div className="api-toolbar-row">
          <label htmlFor="operation-filter">Find endpoint</label>
          <input
            id="operation-filter"
            onChange={(event) => setOperationQuery(event.target.value)}
            placeholder="Filter by method, path, summary"
            value={operationQuery}
          />
        </div>
        <div className="api-operation-groups">
          {filteredOperations.map((group) => (
            <section className="api-operation-group" key={group.group}>
              <h3>{group.group}</h3>
              <ul>
                {group.entries.map((operation) => (
                  <li key={`${operation.method}-${operation.path}`}>
                    <button onClick={() => jumpToOperation(operation)} type="button">
                      <strong>{operation.method.toUpperCase()}</strong> {operation.path}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <div className="api-reference-shell">
        <SwaggerUI
          deepLinking
          defaultModelsExpandDepth={-1}
          displayOperationId
          displayRequestDuration
          docExpansion="list"
          filter={operationQuery}
          persistAuthorization
          requestInterceptor={(request) => {
            const headerValue = toHeaderValue(token);
            if (headerValue) {
              const headers = request.headers ?? {};
              return {
                ...request,
                headers: {
                  ...headers,
                  Authorization: headerValue,
                },
              };
            }
            return request;
          }}
          spec={spec}
          tryItOutEnabled
        />
      </div>
    </div>
  );
}
