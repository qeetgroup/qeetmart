import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter";

export type DocFrontmatter = {
  title: string;
  description: string;
  section?: string;
  order?: number;
  lastUpdated?: string;
};

export type DocSource = {
  frontmatter: DocFrontmatter;
  content: string;
  slug: string[];
  filePath: string;
};

const CONTENT_ROOT = path.join(process.cwd(), "content");

const walkMdxFiles = (directory: string): string[] => {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const info = statSync(fullPath);
    if (info.isDirectory()) {
      files.push(...walkMdxFiles(fullPath));
      continue;
    }
    if (fullPath.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
};

const toSlugParts = (absolutePath: string, version: string): string[] => {
  const versionRoot = path.join(CONTENT_ROOT, version);
  const relativePath = path.relative(versionRoot, absolutePath);
  const withoutExtension = relativePath.replace(/\.mdx$/, "");
  if (withoutExtension === "index") {
    return [];
  }
  return withoutExtension.split(path.sep);
};

const toAbsoluteDocPath = (version: string, slug: string[]): string | null => {
  const versionRoot = path.join(CONTENT_ROOT, version);
  if (!existsSync(versionRoot)) {
    return null;
  }

  if (slug.length === 0) {
    const rootIndex = path.join(versionRoot, "index.mdx");
    return existsSync(rootIndex) ? rootIndex : null;
  }

  const directFile = path.join(versionRoot, `${path.join(...slug)}.mdx`);
  if (existsSync(directFile)) {
    return directFile;
  }

  const nestedIndex = path.join(versionRoot, ...slug, "index.mdx");
  if (existsSync(nestedIndex)) {
    return nestedIndex;
  }

  return null;
};

const extractFrontmatter = (source: string, filePath: string): { frontmatter: DocFrontmatter; content: string } => {
  const parsed = parseFrontmatter(source);
  const title = parsed.data.title;
  const description = parsed.data.description;

  if (typeof title !== "string" || typeof description !== "string") {
    throw new Error(`Doc frontmatter is missing required fields in ${path.relative(process.cwd(), filePath)}`);
  }

  return {
    frontmatter: {
      title,
      description,
      section: typeof parsed.data.section === "string" ? parsed.data.section : undefined,
      order: typeof parsed.data.order === "number" ? parsed.data.order : undefined,
      lastUpdated: typeof parsed.data.lastUpdated === "string" ? parsed.data.lastUpdated : undefined,
    },
    content: parsed.content,
  };
};

export const getAvailableContentVersions = (): string[] => {
  if (!existsSync(CONTENT_ROOT)) {
    return [];
  }

  return readdirSync(CONTENT_ROOT).filter((entry) => {
    const fullPath = path.join(CONTENT_ROOT, entry);
    return statSync(fullPath).isDirectory();
  });
};

export const getAllDocSlugs = (version: string): string[][] => {
  const versionRoot = path.join(CONTENT_ROOT, version);
  if (!existsSync(versionRoot)) {
    return [];
  }

  const files = walkMdxFiles(versionRoot);
  return files.map((file) => toSlugParts(file, version));
};

export const getDocSource = (version: string, slug: string[]): DocSource | null => {
  const absolutePath = toAbsoluteDocPath(version, slug);
  if (!absolutePath) {
    return null;
  }

  const raw = readFileSync(absolutePath, "utf8");
  const parsed = extractFrontmatter(raw, absolutePath);

  return {
    frontmatter: parsed.frontmatter,
    content: parsed.content,
    slug: toSlugParts(absolutePath, version),
    filePath: absolutePath,
  };
};

export const getDocMetadata = (version: string): Array<DocFrontmatter & { slug: string[] }> => {
  const versionRoot = path.join(CONTENT_ROOT, version);
  if (!existsSync(versionRoot)) {
    return [];
  }

  const files = walkMdxFiles(versionRoot);
  return files
    .map((file) => {
      const raw = readFileSync(file, "utf8");
      const parsed = extractFrontmatter(raw, file);

      return {
        ...parsed.frontmatter,
        slug: toSlugParts(file, version),
      };
    })
    .filter((entry): entry is DocFrontmatter & { slug: string[] } => Boolean(entry));
};
