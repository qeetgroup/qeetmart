export type SearchEntry = {
  title: string;
  description: string;
  href: string;
  body: string;
  version: string;
  section: string;
};

const tokenize = (query: string): string[] => {
  return query
    .toLowerCase()
    .split(/[\s/:-]+/)
    .map((term) => term.trim())
    .filter(Boolean);
};

const scoreTerm = (target: string, term: string, baseWeight: number): number => {
  if (!target.includes(term)) {
    return 0;
  }
  if (target.startsWith(term)) {
    return baseWeight + 6;
  }
  return baseWeight;
};

const scoreEntry = (entry: SearchEntry, terms: string[], rawQuery: string): number => {
  const title = entry.title.toLowerCase();
  const description = entry.description.toLowerCase();
  const body = entry.body.toLowerCase();
  const section = entry.section.toLowerCase();
  const href = entry.href.toLowerCase();
  const exact = rawQuery.trim().toLowerCase();

  let score = 0;

  for (const term of terms) {
    score += scoreTerm(title, term, 52);
    score += scoreTerm(description, term, 24);
    score += scoreTerm(section, term, 18);
    score += scoreTerm(href, term, 20);
    score += scoreTerm(body, term, 7);
  }

  if (exact && title === exact) {
    score += 35;
  }

  if (exact && href.includes(exact)) {
    score += 14;
  }

  if (entry.section === "API Reference" && terms.some((term) => ["get", "post", "put", "patch", "delete"].includes(term))) {
    score += 8;
  }

  return score;
};

export const rankEntries = (entries: SearchEntry[], query: string, limit = 10): SearchEntry[] => {
  if (!query.trim()) {
    return [];
  }

  const terms = tokenize(query);
  if (terms.length === 0) {
    return [];
  }

  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, terms, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((item) => item.entry);
};
