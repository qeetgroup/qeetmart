import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Callout } from "./callout";
import { CodeBlock } from "./code-block";
import { EnvVarTable } from "./env-var-table";
import { MermaidDiagram } from "./mermaid-diagram";
import { Step, Steps } from "./steps";

type MdxLinkProps = ComponentPropsWithoutRef<"a"> & {
  href?: string;
  children: ReactNode;
};

const linkClassName =
  "font-medium text-primary underline decoration-primary/30 transition-colors duration-150 hover:text-primary/85";

export const mdxComponents = {
  a: ({ className, href = "", children, ...props }: MdxLinkProps) => {
    if (href.startsWith("/")) {
      return (
        <Link className={cn(linkClassName, className)} href={href} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <a className={cn(linkClassName, className)} href={href} rel="noreferrer" target="_blank" {...props}>
        {children}
      </a>
    );
  },
  p: ({ className, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p className={cn("my-4 text-[15px] leading-7 text-muted-foreground", className)} {...props} />
  ),
  h2: ({ className, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2 className={cn("mt-8 scroll-mt-20 text-2xl font-semibold tracking-tight text-foreground", className)} {...props} />
  ),
  h3: ({ className, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3 className={cn("mt-7 scroll-mt-20 text-xl font-semibold tracking-tight text-foreground", className)} {...props} />
  ),
  h4: ({ className, ...props }: ComponentPropsWithoutRef<"h4">) => (
    <h4 className={cn("mt-6 scroll-mt-20 text-lg font-semibold text-foreground", className)} {...props} />
  ),
  ul: ({ className, ...props }: ComponentPropsWithoutRef<"ul">) => (
    <ul className={cn("my-4 list-disc space-y-1.5 pl-5 text-muted-foreground", className)} {...props} />
  ),
  ol: ({ className, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol className={cn("my-4 list-decimal space-y-1.5 pl-5 text-muted-foreground", className)} {...props} />
  ),
  li: ({ className, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li className={cn("pl-1 text-[15px] leading-7", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className={cn("my-4 border-l-2 border-primary/35 pl-4 text-muted-foreground", className)} {...props} />
  ),
  hr: ({ className, ...props }: ComponentPropsWithoutRef<"hr">) => <hr className={cn("my-6 border-border", className)} {...props} />,
  code: ({ className, ...props }: ComponentPropsWithoutRef<"code">) => {
    if (className?.includes("language-")) {
      return <code className={className} {...props} />;
    }

    return <code className={cn("rounded bg-muted px-1.5 py-0.5 text-[13px] text-foreground", className)} {...props} />;
  },
  table: ({ className, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className={cn("w-full min-w-[680px] border-collapse text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th className={cn("bg-muted px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)} {...props} />
  ),
  td: ({ className, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td className={cn("border-t border-border px-3 py-2 align-top text-sm text-muted-foreground", className)} {...props} />
  ),
  pre: ({ children }: { children: ReactNode }) => <CodeBlock>{children}</CodeBlock>,
  Callout,
  Steps,
  Step,
  EnvVarTable,
  MermaidDiagram,
};
