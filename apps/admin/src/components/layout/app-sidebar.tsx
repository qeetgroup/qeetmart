import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navItems } from '@/app/navigation'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'

interface AppSidebarProps {
  mobile?: boolean
  onNavigate?: () => void
}

export function AppSidebar({ mobile = false, onNavigate }: AppSidebarProps) {
  const user = useAuthStore((state) => state.user)
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  const visibleItems = navItems.filter((item) =>
    item.allowedRoles ? (user ? item.allowedRoles.includes(user.role) : false) : true,
  )

  return (
    <aside
      className={cn(
        'h-full border-r border-border/70 bg-card/80 backdrop-blur-lg',
        mobile ? 'w-full max-w-xs' : isSidebarCollapsed ? 'w-[84px]' : 'w-[260px]',
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className={cn('overflow-hidden transition-all', !mobile && isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100')}>
            <p className="font-display text-lg font-bold">QeetMart Admin</p>
            <p className="text-xs text-muted-foreground">Control Center</p>
          </div>
          {!mobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          )}
        </div>

        <TooltipProvider delayDuration={100}>
          <nav className="flex-1 space-y-1 p-3" aria-label="Main navigation">
            {visibleItems.map((item) => {
              const linkNode = ({ isActive }: { isActive: boolean }) => (
                <div
                  className={cn(
                    'flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
                    !mobile && isSidebarCollapsed ? 'justify-center px-2' : 'gap-3',
                  )}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {(mobile || !isSidebarCollapsed) && <span>{item.label}</span>}
                </div>
              )

              if (!mobile && isSidebarCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <NavLink to={item.href} end={item.href === '/'} onClick={onNavigate}>
                        {linkNode}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <NavLink key={item.href} to={item.href} end={item.href === '/'} onClick={onNavigate}>
                  {linkNode}
                </NavLink>
              )
            })}
          </nav>
        </TooltipProvider>

        <div className="border-t p-3 text-xs text-muted-foreground">
          <p className="truncate">Signed in as {user?.name ?? 'Unknown'}</p>
          <p className="capitalize">Role: {user?.role?.replace('_', ' ') ?? 'n/a'}</p>
        </div>
      </div>
    </aside>
  )
}
