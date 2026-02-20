"use client";

import dynamic from "next/dynamic";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

type ApiReferenceClientProps = {
  spec: unknown;
};

export function ApiReferenceClient({ spec }: ApiReferenceClientProps) {
  return (
    <div className="api-reference-shell">
      <SwaggerUI docExpansion="list" displayOperationId spec={spec} tryItOutEnabled />
    </div>
  );
}
