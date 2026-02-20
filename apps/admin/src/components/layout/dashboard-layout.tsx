import { Outlet } from 'react-router-dom'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen md:flex">
      <div className="hidden md:sticky md:top-0 md:block md:h-screen md:shrink-0">
        <AppSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
