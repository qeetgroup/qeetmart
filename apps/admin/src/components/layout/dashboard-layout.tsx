import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'

const easing = [0.22, 1, 0.36, 1] as const

export function DashboardLayout() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  return (
    <div className="min-h-screen md:flex">
      <a
        href="#dashboard-main-content"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <div className="hidden md:sticky md:top-0 md:block md:h-screen md:shrink-0">
        <AppSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main id="dashboard-main-content" className="flex-1 overflow-x-hidden p-4 sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: easing }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
