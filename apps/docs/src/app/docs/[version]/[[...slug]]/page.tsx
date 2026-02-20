import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { DocContextRail, type TocHeading } from "@/components/layout/doc-context-rail";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { getDocSource, getAllDocSlugs } from "@/lib/docs/content";
import { DOC_VERSIONS, getDocsNavigation, isValidVersion } from "@/lib/docs/config";

type PageProps = {
  params: Promise<{ version: string; slug?: string[] }>;
};

export const dynamicParams = false;

export const generateStaticParams = () => {
  return DOC_VERSIONS.flatMap((version) =>
    getAllDocSlugs(version).map((slug) => ({
      version,
      slug,
    })),
  );
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { version, slug } = await params;
  if (!isValidVersion(version)) {
    return {};
  }

  const doc = getDocSource(version, slug ?? []);
  if (!doc) {
    return {};
  }

  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  };
}

const toSlugId = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const extractHeadings = (source: string): TocHeading[] => {
  const lines = source.split(/\r?\n/);
  const headings: TocHeading[] = [];
  const seen = new Map<string, number>();

  for (const line of lines) {
    const match = /^(##|###)\s+(.+)$/.exec(line.trim());
    if (!match) {
      continue;
    }
    const level = match[1].length as 2 | 3;
    const rawText = match[2].trim();
    const baseId = toSlugId(rawText);
    if (!baseId) {
      continue;
    }
    const existing = seen.get(baseId) ?? 0;
    const id = existing === 0 ? baseId : `${baseId}-${existing}`;
    seen.set(baseId, existing + 1);

    headings.push({
      id,
      text: rawText.replace(/`/g, ""),
      level,
    });
  }

  return headings;
};

const toDocHref = (version: string, slug: string[]): string => {
  if (slug.length === 0) {
    return `/docs/${version}`;
  }
  return `/docs/${version}/${slug.join("/")}`;
};

export default async function DocsPage({ params }: PageProps) {
  const { version, slug } = await params;

  if (!isValidVersion(version)) {
    notFound();
  }

  const doc = getDocSource(version, slug ?? []);
  if (!doc) {
    notFound();
  }

  const headings = extractHeadings(doc.content);
  const currentHref = toDocHref(version, doc.slug);
  const navItems = getDocsNavigation(version).flatMap((section) => section.items);
  const currentIndex = navItems.findIndex((item) => item.href === currentHref);
  const neighbors =
    currentIndex >= 0
      ? [
          currentIndex > 0
            ? {
                label: "Previous" as const,
                title: navItems[currentIndex - 1].title,
                href: navItems[currentIndex - 1].href,
              }
            : null,
          currentIndex < navItems.length - 1
            ? {
                label: "Next" as const,
                title: navItems[currentIndex + 1].title,
                href: navItems[currentIndex + 1].href,
              }
            : null,
        ].filter((entry): entry is { label: "Previous" | "Next"; title: string; href: string } => Boolean(entry))
      : navItems[0]
        ? [{ label: "Next" as const, title: navItems[0].title, href: navItems[0].href }]
        : [];

  const { content } = await compileMDX({
    source: doc.content,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "append" }]],
      },
    },
  });

  return (
    <div className="doc-layout-grid">
      <article className="doc-article">
        <header>
          <h1>{doc.frontmatter.title}</h1>
          <p>{doc.frontmatter.description}</p>
          {doc.frontmatter.lastUpdated ? <small>Last updated: {doc.frontmatter.lastUpdated}</small> : null}
        </header>
        <section>{content}</section>
      </article>
      <DocContextRail headings={headings} neighbors={neighbors} />
    </div>
  );
}
