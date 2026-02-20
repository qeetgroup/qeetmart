import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import { notFound } from "next/navigation";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { getDocSource, getAllDocSlugs } from "@/lib/docs/content";
import { DOC_VERSIONS, isValidVersion } from "@/lib/docs/config";

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

export default async function DocsPage({ params }: PageProps) {
  const { version, slug } = await params;

  if (!isValidVersion(version)) {
    notFound();
  }

  const doc = getDocSource(version, slug ?? []);
  if (!doc) {
    notFound();
  }

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
    <article className="doc-article">
      <header>
        <h1>{doc.frontmatter.title}</h1>
        <p>{doc.frontmatter.description}</p>
        {doc.frontmatter.lastUpdated ? <small>Last updated: {doc.frontmatter.lastUpdated}</small> : null}
      </header>
      <section>{content}</section>
    </article>
  );
}
