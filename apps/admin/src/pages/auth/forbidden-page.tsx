import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ForbiddenPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Access denied</CardTitle>
          <CardDescription>
            Your account does not have sufficient permissions for this section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/">Return to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
