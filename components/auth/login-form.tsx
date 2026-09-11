"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signInWithUsernameOrEmail } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/client"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Lock, ShieldCheck, Utensils, Users, Package, TrendingUp } from "lucide-react"
import { ROLE_HOME } from "@/lib/constants"

const FEATURES = [
  { icon: Utensils, label: "POS & Orders", color: "text-emerald-400" },
  { icon: Users, label: "Staff Management", color: "text-blue-400" },
  { icon: Package, label: "Inventory", color: "text-orange-400" },
  { icon: TrendingUp, label: "Analytics", color: "text-purple-400" },
]

export function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next")

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await signInWithUsernameOrEmail(identifier, password)
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Successful login - wait a moment for session to settle
    await new Promise(resolve => setTimeout(resolve, 300))

    // Fetch the user's profile to determine their role
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role) {
        // Redirect directly to role-specific dashboard
        const roleHome = ROLE_HOME[profile.role] || "/admin"
        const dest = next || roleHome
        
        console.log('[login] Redirecting:', { 
          role: profile.role, 
          roleHome,
          next,
          dest 
        })
        
        router.push(dest)
        router.refresh()
        return
      }
    }

    // Fallback: redirect to root page (will auto-redirect based on session)
    router.push(next || "/")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Full background image for entire screen */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/LydiasBG3.png" 
          alt="Restaurant background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Left Side - Marketing/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between z-10">
        {/* Gradient overlay - fades from left to center */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/98 via-black/70 via-75% to-transparent" />
        
        <div className="relative z-10">
          <Brand className="mb-8" />
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium mb-4">
              ENTERPRISE RESTAURANT & BAR OPERATIONS
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Run your entire floor,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                bar, and kitchen
              </span>
              <br />
              from one platform
            </h1>
            <p className="text-slate-400 text-lg mt-4 max-w-md">
              Lydias Lechon unifies QR self-ordering, point-of-sale, waiter coordination, payments, reservations, and analytics — built for high-volume hospitality.
            </p>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-3 mt-8">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <feature.icon className={`size-4 ${feature.color}`} />
                <span className="text-sm text-slate-300">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Additional Section */}
          <div className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold text-white">
              One system for every role on your team
            </h2>
            <p className="text-slate-400 text-base max-w-lg">
              Purpose-built consoles for administrators, cashiers, and waiters — plus a frictionless guest ordering experience.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500">
          © 2026 Restaurant Management System. All rights reserved.
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md relative z-10">
          {/* Mobile Brand */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Brand />
          </div>

          {/* Login Card */}  
          <div className="rounded-2xl bg-white/10 dark:bg-slate-900/20 backdrop-blur-xl shadow-2xl p-8 border-0">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mb-4">
                <Lock className="size-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Secure Login
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Access your enterprise dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-slate-700 dark:text-slate-300">
                  Username or Email
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Staff: use your username • Customers: use your email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    Remember this device
                  </label>
                </div>
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 px-4 py-3 text-sm text-red-800 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4 mr-2" />
                    Sign In Securely
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Customer?{" "}
                <Link 
                  href="/signup" 
                  className="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
                >
                  Create an account
                </Link>
              </p>
              <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-2">
                Staff accounts are managed by administrators
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
