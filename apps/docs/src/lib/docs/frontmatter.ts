export type ParsedFrontmatter = {
  data: Record<string, string | number | boolean>;
  content: string;
};

const coerceValue = (raw: string): string | number | boolean => {
  const value = raw.trim();
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return value.replace(/^['\"]|['\"]$/g, "");
};

export const parseFrontmatter = (source: string): ParsedFrontmatter => {
  if (!source.startsWith("---\n")) {
    return { data: {}, content: source };
  }

  const marker = "\n---\n";
  const endIndex = source.indexOf(marker, 4);
  if (endIndex === -1) {
    return { data: {}, content: source };
  }

  const block = source.slice(4, endIndex);
  const content = source.slice(endIndex + marker.length);
  const data: Record<string, string | number | boolean> = {};

  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf(":");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    data[key] = coerceValue(rawValue);
  }

  return { data, content };
};
