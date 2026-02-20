import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "../../..");
const contentRoot = path.join(repoRoot, "apps", "docs", "content");
const openapiRoot = path.join(repoRoot, "apps", "docs", "openapi");

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

const errors = [];

for (const version of readdirSync(contentRoot)) {
  const versionDir = path.join(contentRoot, version);
  if (!statSync(versionDir).isDirectory()) {
    continue;
  }

  const validDocPaths = new Set();
  const files = walk(versionDir);

  for (const file of files) {
    const relative = path.relative(versionDir, file).replace(/\.mdx$/, "");
    const href = relative === "index" ? `/docs/${version}` : `/docs/${version}/${relative}`;
    validDocPaths.add(href);
  }

  const openapiDir = path.join(openapiRoot, version);
  const validApiPaths = new Set();
  if (existsSync(openapiDir) && statSync(openapiDir).isDirectory()) {
    for (const file of readdirSync(openapiDir)) {
      if (file.endsWith(".json")) {
        validApiPaths.add(`/reference/${version}/${file.replace(/\.json$/, "")}`);
      }
    }
  }

  for (const file of files) {
    const raw = readFileSync(file, "utf8");
    const parsed = parseFrontmatter(raw);

    if (!parsed.data.title) {
      errors.push(`${path.relative(repoRoot, file)}: missing frontmatter title`);
    }

    if (!parsed.data.description) {
      errors.push(`${path.relative(repoRoot, file)}: missing frontmatter description`);
    }

    if (!parsed.data.section) {
      errors.push(`${path.relative(repoRoot, file)}: missing frontmatter section`);
    }

    const markdownLinks = [...parsed.content.matchAll(/\[[^\]]+\]\((\/[^\)]+)\)/g)].map((match) => match[1]);
    for (const link of markdownLinks) {
      if (link.startsWith(`/docs/${version}`) && !validDocPaths.has(link)) {
        errors.push(`${path.relative(repoRoot, file)}: broken internal docs link ${link}`);
      }
      if (link.startsWith(`/reference/${version}`) && !validApiPaths.has(link) && link !== `/reference/${version}`) {
        errors.push(`${path.relative(repoRoot, file)}: broken API reference link ${link}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Docs content validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Docs content validation passed.");
