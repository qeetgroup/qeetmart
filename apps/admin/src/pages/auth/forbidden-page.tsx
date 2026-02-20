import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const clearSession = useAuthStore((state) => state.clearSession)

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Access denied</CardTitle>
          <CardDescription>
            Your account does not have sufficient permissions for this section.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={() => navigate('/')}>Return to dashboard</Button>
          <Button
            onClick={() => {
              clearSession()
              navigate('/login', { replace: true })
            }}
          >
            Switch account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
