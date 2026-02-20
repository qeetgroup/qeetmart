import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const OPENAPI_ROOT = path.join(process.cwd(), "openapi");

export type OpenApiSpecMeta = {
  serviceId: string;
  fileName: string;
  filePath: string;
};

export const getOpenApiSpecs = (version: string): OpenApiSpecMeta[] => {
  const versionDir = path.join(OPENAPI_ROOT, version);
  if (!existsSync(versionDir)) {
    return [];
  }

  return readdirSync(versionDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      const filePath = path.join(versionDir, fileName);
      const info = statSync(filePath);
      if (!info.isFile()) {
        return null;
      }

      return {
        serviceId: fileName.replace(/\.json$/, ""),
        fileName,
        filePath,
      };
    })
    .filter((entry): entry is OpenApiSpecMeta => Boolean(entry));
};

export const getOpenApiSpec = (version: string, serviceId: string): unknown | null => {
  const filePath = path.join(OPENAPI_ROOT, version, `${serviceId}.json`);
  if (!existsSync(filePath)) {
    return null;
  }

  const raw = readFileSync(filePath, "utf8");
  return JSON.parse(raw) as unknown;
};
