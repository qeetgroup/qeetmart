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
    return <p>No environment variables are registered for `{service}`.</p>;
  }

  return (
    <div className="env-table-wrap">
      <table className="env-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Required</th>
            <th>Default</th>
            <th>Description</th>
            <th>Environments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>{row.required ? "Yes" : "No"}</td>
              <td>{row.default ? <code>{row.default}</code> : "-"}</td>
              <td>{row.description}</td>
              <td>{row.environments.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
