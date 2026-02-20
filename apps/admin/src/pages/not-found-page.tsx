import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">404</p>
        <h2 className="mt-2 text-3xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The requested resource does not exist.</p>
        <Button asChild className="mt-5">
          <Link to="/">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
