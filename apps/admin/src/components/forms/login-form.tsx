import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services'
import { useAuthStore } from '@/stores/auth-store'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must include at least 8 characters.')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must include at least one number.'),
})

type LoginSchema = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@qeetmart.com',
      password: 'Admin#1234',
    },
  })

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess(data) {
      setSession(data.token, data.user)
      navigate('/')
    },
  })

  function onSubmit(values: LoginSchema) {
    mutation.mutate(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register('password')}
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {mutation.error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive" role="alert">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4" aria-hidden="true" />
            <span>{mutation.error.message}</span>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Signing in
          </>
        ) : (
          'Sign in'
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Demo accounts: `admin@qeetmart.com`, `ops@qeetmart.com`, `support@qeetmart.com`
      </p>
    </form>
  )
}
