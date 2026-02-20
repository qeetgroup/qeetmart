import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "../../..");
const contentRoot = path.join(repoRoot, "apps", "docs", "content");
const openapiRoot = path.join(repoRoot, "apps", "docs", "openapi");
const outputRoot = path.join(repoRoot, "apps", "docs", "public", "search-index");

const parseFrontmatter = (source) => {
  if (!source.startsWith("---\n")) {
    return { data: {}, content: source };
  }

  const marker = "\n---\n";
  const end = source.indexOf(marker, 4);
  if (end === -1) {
    return { data: {}, content: source };
  }

  const block = source.slice(4, end);
  const content = source.slice(end + marker.length);
  const data = {};

  for (const line of block.split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['\"]|['\"]$/g, "");
    if (key) {
      data[key] = value;
    }
  }

  return { data, content };
};

const walk = (directory) => {
  const entries = readdirSync(directory);
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const info = statSync(fullPath);
    if (info.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }
    if (fullPath.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
};

const stripMdx = (source) => {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[[^\]]+\]\([^\)]+\)/g, " ")
    .replace(/[\*#>`_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const toDocHref = (version, filePath) => {
  const relative = path.relative(path.join(contentRoot, version), filePath).replace(/\.mdx$/, "");
  const normalized = relative.split(path.sep).join("/");
  const slug = normalized === "index" ? "" : normalized.replace(/\/index$/, "");
  return slug ? `/docs/${version}/${slug}` : `/docs/${version}`;
};

mkdirSync(outputRoot, { recursive: true });

const versions = readdirSync(contentRoot).filter((entry) => statSync(path.join(contentRoot, entry)).isDirectory());

for (const version of versions) {
  const entries = [];

  const docsFiles = walk(path.join(contentRoot, version));
  for (const filePath of docsFiles) {
    const raw = readFileSync(filePath, "utf8");
    const parsed = parseFrontmatter(raw);
    const href = toDocHref(version, filePath);

    entries.push({
      version,
      section: String(parsed.data.section ?? "Docs"),
      title: String(parsed.data.title ?? "Untitled"),
      description: String(parsed.data.description ?? ""),
      href,
      body: stripMdx(parsed.content),
    });
  }

  const openapiDir = path.join(openapiRoot, version);
  if (existsSync(openapiDir) && statSync(openapiDir).isDirectory()) {
    for (const file of readdirSync(openapiDir)) {
      if (!file.endsWith(".json")) {
        continue;
      }

      const service = file.replace(/\.json$/, "");
      const spec = JSON.parse(readFileSync(path.join(openapiDir, file), "utf8"));
      const paths = spec.paths ?? {};

      entries.push({
        version,
        section: "API Reference",
        title: `${spec.info?.title ?? service}`,
        description: `OpenAPI reference for ${service}`,
        href: `/reference/${version}/${service}`,
        body: "",
      });

      for (const [pathName, pathItem] of Object.entries(paths)) {
        if (!pathItem || typeof pathItem !== "object") {
          continue;
        }

        for (const [method, operation] of Object.entries(pathItem)) {
          if (!["get", "post", "put", "patch", "delete"].includes(method)) {
            continue;
          }
          if (!operation || typeof operation !== "object") {
            continue;
          }
          entries.push({
            version,
            section: "API Reference",
            title: `${method.toUpperCase()} ${pathName}`,
            description: String(operation.summary ?? `Endpoint in ${service}`),
            href: `/reference/${version}/${service}?operation=${encodeURIComponent(
              String(operation.operationId ?? `${method}-${pathName}`),
            )}`,
            body: `${operation.operationId ?? ""} ${JSON.stringify(operation.responses ?? {})}`,
          });
        }
      }
    }
  }

  writeFileSync(path.join(outputRoot, `${version}.json`), `${JSON.stringify(entries, null, 2)}\n`);
  console.log(`Built search index for ${version} with ${entries.length} entries.`);
}
