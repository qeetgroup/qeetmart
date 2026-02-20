import { useQuery } from '@tanstack/react-query'
import { Bell, CheckCheck, Laptop, LogOut, Menu, Moon, SunMedium } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { routeTitles } from '@/app/navigation'
import { useNotificationActions, useNotifications, useTenants } from '@/hooks'
import { AppBreadcrumbs } from '@/components/layout/app-breadcrumbs'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useTheme } from '@/providers/theme-provider'
import { authService, inventoryService } from '@/services'
import { useAuthStore } from '@/stores/auth-store'
import { useTenantStore } from '@/stores/tenant-store'
import { useUiStore } from '@/stores/ui-store'

export function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const tenantId = useTenantStore((state) => state.tenantId)
  const setTenantId = useTenantStore((state) => state.setTenantId)
  const isMobileSidebarOpen = useUiStore((state) => state.isMobileSidebarOpen)
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen)
  const { setTheme } = useTheme()

  const { data: tenants } = useTenants()
  const notificationsQuery = useNotifications()
  const { markAsRead, markAsUnread, markAllAsRead } = useNotificationActions()

  const lowStockQuery = useQuery({
    queryKey: ['inventory', tenantId, 'header-alert'],
    queryFn: () => inventoryService.getInventorySummary(tenantId),
    staleTime: 1000 * 30,
  })

  const lastLowStockToastKey = useRef<string>('')

  useEffect(() => {
    if (!lowStockQuery.data || lowStockQuery.data.lowStockCount <= 0) {
      return
    }

    const toastKey = `${tenantId}-${lowStockQuery.data.lowStockCount}`
    if (lastLowStockToastKey.current === toastKey) {
      return
    }

    lastLowStockToastKey.current = toastKey
    toast.warning(`${lowStockQuery.data.lowStockCount} products are below reorder threshold.`, {
      description: 'Review inventory alerts to avoid stockouts.',
    })
  }, [lowStockQuery.data, tenantId])

  const title = useMemo(() => routeTitles[location.pathname] ?? 'Admin Dashboard', [location.pathname])

  const initials = useMemo(
    () =>
      user?.name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2) ?? 'AD',
    [user?.name],
  )

  const unreadCount = useMemo(
    () => (notificationsQuery.data ?? []).filter((notification) => !notification.read).length,
    [notificationsQuery.data],
  )

  async function handleLogout() {
    await authService.logout()
    clearSession()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open sidebar">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Browse dashboard modules</SheetDescription>
              </SheetHeader>
              <AppSidebar mobile onNavigate={() => setMobileSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">QeetMart</p>
            <h1 className="truncate text-base font-semibold md:text-xl">{title}</h1>
            <div className="mt-1">
              <AppBreadcrumbs />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Select value={tenantId} onValueChange={setTenantId}>
            <SelectTrigger className="h-9 w-[210px]" aria-label="Select store location">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {(tenants ?? []).map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="View notifications" className="relative">
                <Bell />
                {unreadCount > 0 ? (
                  <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]">
                    {unreadCount}
                  </Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px]">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => markAllAsRead.mutate()}
                >
                  <CheckCheck className="mr-1 size-3.5" /> Mark all read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {notificationsQuery.data?.length ? (
                notificationsQuery.data.slice(0, 7).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="cursor-pointer items-start justify-between gap-2 text-xs"
                    onClick={() => {
                      if (notification.read) {
                        markAsUnread.mutate(notification.id)
                        return
                      }

                      markAsRead.mutate(notification.id)
                      if (notification.actionUrl) {
                        navigate(notification.actionUrl)
                      }
                    }}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="leading-5 text-muted-foreground">{notification.message}</p>
                    </div>
                    <Badge variant={notification.read ? 'outline' : 'secondary'}>
                      {notification.read ? 'Read' : 'Unread'}
                    </Badge>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="cursor-default text-muted-foreground">
                  No notifications
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle theme">
                <SunMedium className="size-4 dark:hidden" />
                <Moon className="hidden size-4 dark:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <SunMedium className="mr-2 size-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 size-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Laptop className="mr-2 size-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 sm:px-3" aria-label="Open profile menu">
                <Avatar className="size-8 border border-border/60">
                  <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm sm:block">{user?.name ?? 'Admin'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="font-medium">{user?.name ?? 'Admin'}</p>
                <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
