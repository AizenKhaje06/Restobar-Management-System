"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Info } from "lucide-react"

export function SignUpForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    
    // Customers have no role or role = 'customer'
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        data: { full_name: fullName },
      },
    })
    
    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }
    
    // If email confirmation is disabled, a session is created immediately.
    const {
      data: { session },
    } = await supabase.auth.getSession()
    
    if (session) {
      router.push("/")
      router.refresh()
    } else {
      router.push("/signup/success")
    }
  }

  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl shadow-black/5">
      <CardHeader className="space-y-3">
        <Brand className="mb-2" />
        <div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Sign up as a customer to place orders and make reservations.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* Staff accounts info banner */}
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
          <div className="flex gap-2">
            <Info className="size-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">Staff Accounts</p>
              <p>
                Staff accounts (Admin, POS, Waiter) are created by administrators only. 
                If you&apos;re a staff member, contact your administrator for login credentials.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input 
              id="fullName" 
              required 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              placeholder="Jane Dela Cruz" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com" 
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              minLength={8} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="At least 8 characters" 
            />
          </div>
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="mt-1">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
