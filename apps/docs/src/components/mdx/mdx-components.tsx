import Link from "next/link";
import { Callout } from "./callout";
import { CodeBlock } from "./code-block";
import { EnvVarTable } from "./env-var-table";
import { MermaidDiagram } from "./mermaid-diagram";
import { Step, Steps } from "./steps";

export const mdxComponents = {
  a: ({ href = "", children, ...props }) => {
    if (href.startsWith("/")) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} rel="noreferrer" target="_blank" {...props}>
        {children}
      </a>
    );
  },
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  Callout,
  Steps,
  Step,
  EnvVarTable,
  MermaidDiagram,
};
