export type SearchEntry = {
  title: string;
  description: string;
  href: string;
  body: string;
  version: string;
  section: string;
};

const normalizeHref = (href: string): string => {
  if (href.length > 1 && href.endsWith("/")) {
    return href.slice(0, -1);
  }
  return href;
};

const scoreEntry = (entry: SearchEntry, query: string): number => {
  const term = query.toLowerCase();
  const title = entry.title.toLowerCase();
  const description = entry.description.toLowerCase();
  const body = entry.body.toLowerCase();

  let score = 0;
  if (title.includes(term)) {
    score += 60;
  }
  if (description.includes(term)) {
    score += 30;
  }
  if (entry.section.toLowerCase().includes(term)) {
    score += 15;
  }
  if (body.includes(term)) {
    score += 8;
  }

  return score;
};

export const rankEntries = (entries: SearchEntry[], query: string, limit = 10): SearchEntry[] => {
  if (!query.trim()) {
    return [];
  }

  const ranked = entries
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));

  const uniqueResults: SearchEntry[] = [];
  const seenHrefs = new Set<string>();

  for (const item of ranked) {
    const href = normalizeHref(item.entry.href);
    if (seenHrefs.has(href)) {
      continue;
    }

    seenHrefs.add(href);
    uniqueResults.push(item.entry);

    if (uniqueResults.length >= limit) {
      break;
    }
  }

  return uniqueResults;
};
