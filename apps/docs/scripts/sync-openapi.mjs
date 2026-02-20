import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "../../..");
const sourceDir = path.join(repoRoot, "contracts", "openapi");
const targetDir = path.join(repoRoot, "apps", "docs", "openapi", "v1");

mkdirSync(targetDir, { recursive: true });

for (const file of readdirSync(targetDir)) {
  if (file.endsWith(".json")) {
    rmSync(path.join(targetDir, file));
  }
}

const files = readdirSync(sourceDir).filter((file) => file.endsWith(".openapi.json"));

for (const file of files) {
  const sourceFile = path.join(sourceDir, file);
  const targetFile = path.join(targetDir, file.replace(/\.openapi\.json$/, ".json"));
  const data = JSON.parse(readFileSync(sourceFile, "utf8"));
  writeFileSync(targetFile, `${JSON.stringify(data, null, 2)}\n`);
}

console.log(`Synced ${files.length} OpenAPI file(s) to apps/docs/openapi/v1.`);
