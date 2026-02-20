import { Navigate } from 'react-router-dom'
import { LoginForm } from '@/components/forms/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { hasPermission, useAuthStore } from '@/stores/auth-store'

export function LoginPage() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)

  if (token && user && hasPermission(user, 'dashboard.read')) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="grid min-h-screen place-items-center bg-mesh-light px-4 py-10">
      <Card className="w-full max-w-md border border-border/60 bg-card/85 shadow-panel backdrop-blur">
        <CardHeader className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">QeetMart</p>
          <CardTitle className="text-2xl">Admin Sign In</CardTitle>
          <CardDescription>
            Authenticate with your admin credentials to access protected controls.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
