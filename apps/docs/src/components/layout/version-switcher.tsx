"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NativeSelect } from "@/components/ui/select";
import { DOC_VERSIONS } from "@/lib/docs/config";

type VersionSwitcherProps = {
  currentVersion: string;
};

const replaceVersionInPath = (pathname: string, nextVersion: string): string => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 2 && (parts[0] === "docs" || parts[0] === "reference")) {
    parts[1] = nextVersion;
    return `/${parts.join("/")}`;
  }
  return `/docs/${nextVersion}`;
};

export function VersionSwitcher({ currentVersion }: VersionSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (version: string) => {
    const path = replaceVersionInPath(pathname, version);
    const query = searchParams.toString();
    router.push(query ? `${path}?${query}` : path);
  };

  return (
    <NativeSelect
      label="Version"
      onValueChange={onChange}
      options={DOC_VERSIONS.map((version) => ({ label: version.toUpperCase(), value: version }))}
      value={currentVersion}
    />
  );
}
