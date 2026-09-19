"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, MapPin, Calendar, Save, AlertCircle, CheckCircle, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { updateEventCustomer } from "@/app/actions/events"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customer, setCustomer] = useState<any>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    date_of_birth: "",
    company_name: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push("/events/login")
      return
    }

    const { data: customerData } = await supabase
      .from("event_customers")
      .select("*")
      .eq("auth_id", user.id)
      .single()

    if (customerData) {
      setCustomer(customerData)
      setFormData({
        full_name: customerData.full_name || "",
        phone: customerData.phone || "",
        address: customerData.address || "",
        date_of_birth: customerData.date_of_birth || "",
        company_name: customerData.company_name || "",
      })
    }

    setLoading(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      const result = await updateEventCustomer({
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address || undefined,
        date_of_birth: formData.date_of_birth || undefined,
        company_name: formData.company_name || undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20 border-b">
        <div className="container mx-auto px-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-6">
            {/* Account Information Card */}
            <div className="p-6 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                  <User className="size-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Account Information</h2>
                  <p className="text-sm text-muted-foreground">
                    Update your personal details
                  </p>
                </div>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-start gap-3">
                  <CheckCircle className="size-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">Profile updated successfully!</div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-start gap-3">
                  <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="size-5 text-muted-foreground" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={customer?.email || ""}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-lg border bg-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="size-5 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleChange("full_name", e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
                      placeholder="Juan Dela Cruz"
                    />
                  </div>
                  {errors.full_name && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.full_name}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="size-5 text-muted-foreground" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
                      placeholder="+63 917 123 4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="size-5 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
                      placeholder="123 Main St, Manila"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="size-5 text-muted-foreground" />
                    </div>
                    <input
                      type="date"
                      id="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={(e) => handleChange("date_of_birth", e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleChange("company_name", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
                    placeholder="Your Company"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For corporate events
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/events/dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin size-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Account Stats */}
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="text-lg font-bold mb-4">Account Statistics</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Member Since</p>
                  <p className="font-bold">{customer?.created_at ? new Date(customer.created_at).toLocaleDateString() : "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email Verified</p>
                  <p className="font-bold">{customer?.is_verified ? "✅ Yes" : "❌ No"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-bold">{customer?.updated_at ? new Date(customer.updated_at).toLocaleDateString() : "-"}</p>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="p-6 rounded-xl border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Lock className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Security</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your password and security settings
                  </p>
                </div>
              </div>
              <a href="/events/forgot-password">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Lock className="size-4 mr-2" />
                  Change Password
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
