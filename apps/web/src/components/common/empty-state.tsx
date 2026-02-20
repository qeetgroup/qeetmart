import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel = "Continue shopping",
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="rounded-full bg-surface-100 p-3 text-surface-700">
          <PackageOpen className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
          <p className="max-w-md text-sm text-surface-600">{description}</p>
        </div>
        {actionHref ? (
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
