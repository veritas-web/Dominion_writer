'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useAppStore } from '@/store/app-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Mail, Lock, LogIn } from 'lucide-react'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const setView = useAppStore((s) => s.setView)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true)
    setServerError('')

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.ok) {
        toast.success('Welcome back!')
        setView('dashboard')
      } else {
        const msg = result?.error === 'CredentialsSignin'
          ? 'Invalid email or password'
          : result?.error || 'Sign in failed'
        setServerError(msg)
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 animate-fade-in">
      <div className="glass-card w-full max-w-md p-6 sm:p-8">
        {/* Back link */}
        <button
          type="button"
          onClick={() => setView('landing')}
          className="mb-6 flex items-center gap-2 text-sm text-dw-text-muted hover:text-dw-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-dw-accent-blue/10">
            <LogIn className="h-6 w-6 text-dw-accent-blue" />
          </div>
          <h1 className="text-2xl font-bold text-dw-text sm:text-3xl">
            Welcome <span className="gradient-text">Back</span>
          </h1>
          <p className="mt-2 text-sm text-dw-text-muted">
            Sign in to continue writing
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-dw-text">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dw-text-muted" />
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="pl-10 border-dw-border bg-dw-navy-light text-dw-text placeholder:text-dw-text-muted/60 focus-visible:ring-dw-accent-blue"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-dw-text">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dw-text-muted" />
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                className="pl-10 border-dw-border bg-dw-navy-light text-dw-text placeholder:text-dw-text-muted/60 focus-visible:ring-dw-accent-blue"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="gradient-btn w-full py-5 text-base font-semibold text-white"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Sign Up link */}
        <p className="mt-6 text-center text-sm text-dw-text-muted">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => setView('signup')}
            className="font-medium text-dw-accent-blue hover:text-dw-accent-blue/80 transition-colors"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  )
}
