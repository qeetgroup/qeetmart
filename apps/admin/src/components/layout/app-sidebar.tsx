import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { preloadRouteModule } from '@/app/lazy-routes'
import { navItems } from '@/app/navigation'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { hasPermission, useAuthStore } from '@/stores/auth-store'
import { useUiStore } from '@/stores/ui-store'

interface AppSidebarProps {
  mobile?: boolean
  onNavigate?: () => void
}

export function AppSidebar({ mobile = false, onNavigate }: AppSidebarProps) {
  const user = useAuthStore((state) => state.user)
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const reduceMotion = useReducedMotion()

  const visibleItems = navItems.filter((item) => {
    if (!user) {
      return false
    }

    if (item.allowedRoles && !item.allowedRoles.includes(user.role)) {
      return false
    }

    if (item.requiredPermission && !hasPermission(user, item.requiredPermission)) {
      return false
    }

    return true
  })

  return (
    <aside
      className={cn(
        'h-full border-r border-border/70 bg-card/80 backdrop-blur-lg',
        mobile ? 'w-full max-w-xs' : isSidebarCollapsed ? 'w-[84px]' : 'w-[260px]',
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <AnimatePresence initial={false} mode="wait">
            {(mobile || !isSidebarCollapsed) && (
              <motion.div
                key="sidebar-brand"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
                className="overflow-hidden"
              >
                <p className="font-display text-lg font-bold">QeetMart Admin</p>
                <p className="text-xs text-muted-foreground">Control Center</p>
              </motion.div>
            )}
          </AnimatePresence>

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
            {visibleItems.map((item, index) => {
              const handlePrefetch = () => {
                void preloadRouteModule(item.href)
              }

              const linkNode = ({ isActive }: { isActive: boolean }) => (
                <motion.div
                  initial={
                    reduceMotion
                      ? { opacity: 1 }
                      : {
                          opacity: 0,
                          x: -8,
                        }
                  }
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.2,
                    delay: reduceMotion ? 0 : index * 0.02,
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          x: mobile || isSidebarCollapsed ? 0 : 2,
                          scale: 1.01,
                        }
                  }
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  className={cn(
                    'relative flex h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
                    !mobile && isSidebarCollapsed ? 'justify-center px-2' : 'gap-3',
                  )}
                >
                  {isActive && !reduceMotion && (
                    <motion.span
                      layoutId={mobile ? undefined : 'active-sidebar-pill'}
                      className="absolute inset-0 -z-10 rounded-lg bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <item.icon className="size-4" aria-hidden="true" />
                  {(mobile || !isSidebarCollapsed) && <span>{item.label}</span>}
                </motion.div>
              )

              if (!mobile && isSidebarCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={item.href}
                        end={item.href === '/'}
                        onClick={onNavigate}
                        onMouseEnter={handlePrefetch}
                        onFocus={handlePrefetch}
                        onTouchStart={handlePrefetch}
                      >
                        {linkNode}
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === '/'}
                  onClick={onNavigate}
                  onMouseEnter={handlePrefetch}
                  onFocus={handlePrefetch}
                  onTouchStart={handlePrefetch}
                >
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
