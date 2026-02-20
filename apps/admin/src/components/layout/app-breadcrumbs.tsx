import { Link, useLocation } from 'react-router-dom'
import { routeTitles } from '@/app/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

function labelForPath(path: string) {
  if (routeTitles[path]) {
    return routeTitles[path]
  }

  const fallback = path.split('/').at(-1) ?? ''
  return fallback
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

export function AppBreadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  const crumbs = segments.map((_, index) => {
    const path = `/${segments.slice(0, index + 1).join('/')}`
    return {
      path,
      label: labelForPath(path),
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {location.pathname === '/' ? (
            <BreadcrumbPage>Dashboard Overview</BreadcrumbPage>
          ) : (
            <Link to="/" className="text-muted-foreground transition hover:text-foreground">
              Dashboard Overview
            </Link>
          )}
        </BreadcrumbItem>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <BreadcrumbItem key={crumb.path}>
              <BreadcrumbSeparator />
              {isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <Link to={crumb.path} className="text-muted-foreground transition hover:text-foreground">
                  {crumb.label}
                </Link>
              )}
            </BreadcrumbItem>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
