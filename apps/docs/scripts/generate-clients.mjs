import { mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "../../..");
const openapiDir = path.join(repoRoot, "apps", "docs", "openapi", "v1");
const outputDir = path.join(repoRoot, "packages", "openapi-clients", "src", "v1");
const indexFile = path.join(repoRoot, "packages", "openapi-clients", "src", "index.ts");

mkdirSync(outputDir, { recursive: true });
for (const file of readdirSync(outputDir)) {
  if (file.endsWith(".ts")) {
    rmSync(path.join(outputDir, file));
  }
}

const pascalCase = (value) => {
  return value
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
};

const methodKeys = ["get", "post", "put", "patch", "delete", "head", "options", "trace"];

const exportLines = [];

for (const file of readdirSync(openapiDir)) {
  if (!file.endsWith(".json")) {
    continue;
  }

  const service = file.replace(/\.json$/, "");
  const spec = JSON.parse(readFileSync(path.join(openapiDir, file), "utf8"));
  const operations = [];

  for (const [routePath, routeSpec] of Object.entries(spec.paths ?? {})) {
    if (!routeSpec || typeof routeSpec !== "object") {
      continue;
    }

    for (const method of methodKeys) {
      const operation = routeSpec[method];
      if (!operation || typeof operation !== "object") {
        continue;
      }

      const operationId = String(operation.operationId ?? `${method}_${routePath}`)
        .replace(/[^A-Za-z0-9_]/g, "_")
        .replace(/_{2,}/g, "_");

      operations.push({
        id: operationId,
        method: method.toUpperCase(),
        path: routePath,
        summary: String(operation.summary ?? ""),
      });
    }
  }

  const typePrefix = pascalCase(service);
  const outFile = path.join(outputDir, `${service}.ts`);

  const lines = [];
  lines.push(`export type ${typePrefix}OperationId =`);
  if (operations.length === 0) {
    lines.push("  never;");
  } else {
    lines.push(operations.map((entry) => `  | \"${entry.id}\"`).join("\n") + ";");
  }

  lines.push("");
  lines.push(`export type ${typePrefix}Operation = {`);
  lines.push("  id: string;");
  lines.push("  method: string;");
  lines.push("  path: string;");
  lines.push("  summary: string;");
  lines.push("};");
  lines.push("");
  lines.push(`export const ${typePrefix}Operations: ${typePrefix}Operation[] = [`);
  for (const entry of operations) {
    lines.push(
      `  { id: \"${entry.id}\", method: \"${entry.method}\", path: \"${entry.path}\", summary: ${JSON.stringify(entry.summary)} },`,
    );
  }
  lines.push("];\n");

  writeFileSync(outFile, `${lines.join("\n")}\n`);

  exportLines.push(`export * from \"./v1/${service}\";`);
}

writeFileSync(indexFile, `${exportLines.join("\n")}\n`);
console.log("Generated TypeScript API operation references.");
