import { ChevronRight } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

const Breadcrumb = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<'nav'>>(
  ({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />,
)
Breadcrumb.displayName = 'Breadcrumb'

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<'ol'>>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        'flex flex-wrap items-center gap-1.5 break-words text-xs text-muted-foreground sm:gap-2.5',
        className,
      )}
      {...props}
    />
  ),
)
BreadcrumbList.displayName = 'BreadcrumbList'

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('inline-flex items-center gap-1.5', className)} {...props} />,
)
BreadcrumbItem.displayName = 'BreadcrumbItem'

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => <span ref={ref} className={cn('font-medium text-foreground', className)} {...props} />,
)
BreadcrumbPage.displayName = 'BreadcrumbPage'

const BreadcrumbSeparator = ({ className, ...props }: React.ComponentProps<'li'>) => (
  <li role="presentation" aria-hidden="true" className={cn('[&>svg]:size-3.5', className)} {...props}>
    <ChevronRight />
  </li>
)
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'

export { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator }
