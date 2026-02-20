"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DOC_ENVIRONMENTS } from "@/lib/docs/config";

type EnvironmentSwitcherProps = {
  currentEnvironment: string;
};

export function EnvironmentSwitcher({ currentEnvironment }: EnvironmentSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (env: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("env", env);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <label className="select-shell">
      <span>Environment</span>
      <select onChange={(event) => onChange(event.target.value)} value={currentEnvironment}>
        {DOC_ENVIRONMENTS.map((env) => (
          <option key={env} value={env}>
            {env}
          </option>
        ))}
      </select>
    </label>
  );
}
