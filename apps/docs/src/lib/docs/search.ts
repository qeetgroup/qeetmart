export type SearchEntry = {
  title: string;
  description: string;
  href: string;
  body: string;
  version: string;
  section: string;
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

  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((item) => item.entry);
};
