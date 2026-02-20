import envCatalog from "@/data/env-vars.v1.json";

type EnvRow = {
  name: string;
  required: boolean;
  default: string;
  description: string;
  environments: string[];
};

type EnvCatalog = Record<string, EnvRow[]>;

type EnvVarTableProps = {
  service: string;
};

export function EnvVarTable({ service }: EnvVarTableProps) {
  const rows = (envCatalog as EnvCatalog)[service] ?? [];

  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
        No environment variables are registered for <code>{service}</code>.
      </p>
    );
  }

  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Name</th>
            <th className="px-3 py-2 text-left font-semibold">Required</th>
            <th className="px-3 py-2 text-left font-semibold">Default</th>
            <th className="px-3 py-2 text-left font-semibold">Description</th>
            <th className="px-3 py-2 text-left font-semibold">Environments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-t border-border align-top" key={row.name}>
              <td className="px-3 py-2">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">{row.name}</code>
              </td>
              <td className="px-3 py-2 text-muted-foreground">{row.required ? "Yes" : "No"}</td>
              <td className="px-3 py-2">
                {row.default ? <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">{row.default}</code> : "-"}
              </td>
              <td className="px-3 py-2 text-muted-foreground">{row.description}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.environments.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
