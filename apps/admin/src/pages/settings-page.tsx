import { Monitor, Moon, SunMedium } from 'lucide-react'
import { useTheme } from '@/providers/theme-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/stores/auth-store'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>Interface Preferences</CardTitle>
          <CardDescription>Customize theme and admin workspace behavior.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              className={`rounded-lg border p-3 text-left transition ${
                theme === 'light' ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary'
              }`}
              onClick={() => setTheme('light')}
            >
              <SunMedium className="mb-2 size-4" />
              <p className="font-medium">Light</p>
              <p className="text-xs text-muted-foreground">Optimized for daytime usage</p>
            </button>

            <button
              type="button"
              className={`rounded-lg border p-3 text-left transition ${
                theme === 'dark' ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary'
              }`}
              onClick={() => setTheme('dark')}
            >
              <Moon className="mb-2 size-4" />
              <p className="font-medium">Dark</p>
              <p className="text-xs text-muted-foreground">Reduced eye strain at night</p>
            </button>

            <button
              type="button"
              className={`rounded-lg border p-3 text-left transition ${
                theme === 'system' ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary'
              }`}
              onClick={() => setTheme('system')}
            >
              <Monitor className="mb-2 size-4" />
              <p className="font-medium">System</p>
              <p className="text-xs text-muted-foreground">Follow OS preference</p>
            </button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="email-alerts">Email alerts</Label>
                <p className="text-xs text-muted-foreground">Receive operational alerts in your inbox.</p>
              </div>
              <Switch id="email-alerts" defaultChecked />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="in-app-alerts">In-app notifications</Label>
                <p className="text-xs text-muted-foreground">Show toasts for order and product events.</p>
              </div>
              <Switch id="in-app-alerts" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Active admin profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Name:</span> {user?.name}
          </p>
          <p>
            <span className="text-muted-foreground">Email:</span> {user?.email}
          </p>
          <p>
            <span className="text-muted-foreground">Role:</span> {user?.role.replace('_', ' ')}
          </p>
          <p className="text-xs text-muted-foreground">Password and MFA flows should be connected to a real backend in production.</p>
        </CardContent>
      </Card>
    </div>
  )
}
