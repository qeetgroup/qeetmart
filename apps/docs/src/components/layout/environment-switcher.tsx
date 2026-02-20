"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NativeSelect } from "@/components/ui/select";
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
    <NativeSelect
      label="Environment"
      onValueChange={onChange}
      options={DOC_ENVIRONMENTS.map((env) => ({ label: env, value: env }))}
      value={currentEnvironment}
    />
  );
}
