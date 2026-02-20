import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-secondary/20 px-4 py-8 text-center',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mb-3 rounded-full bg-background p-2 text-muted-foreground">
        {icon ?? <Inbox className="size-4" aria-hidden="true" />}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
