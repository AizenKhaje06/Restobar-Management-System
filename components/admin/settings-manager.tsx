"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Clock,
  ImageIcon,
  Mail,
  MapPin,
  Percent,
  Phone,
  Receipt,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { updateRestaurantSettingsAction } from "@/app/actions/admin"
import type { RestaurantSettings } from "@/lib/types"

// Compress image client-side before upload
async function compressImage(file: File, maxDim = 800, quality = 0.75): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Compression failed"))
        },
        "image/jpeg",
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }
    img.src = url
  })
}

const DEFAULT_SETTINGS: RestaurantSettings = {
  id: 1,
  name: "Lumière",
  tagline: "Restaurant & Bar",
  address: null,
  phone: null,
  email: null,
  tin: null,
  logo_url: null,
  currency: "₱",
  tax_rate: 12,
  service_charge: 0,
  receipt_footer: null,
  open_time: "10:00:00",
  close_time: "23:00:00",
  updated_at: new Date().toISOString(),
}

export function SettingsManager({ settings }: { settings: RestaurantSettings | null }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const s = settings ?? DEFAULT_SETTINGS

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const fd = new FormData(e.currentTarget)

    // Compress logo if a new file is selected
    const logoFile = fd.get("logo_file")
    if (logoFile instanceof File && logoFile.size > 0) {
      setCompressing(true)
      try {
        const compressed = await compressImage(logoFile)
        // Replace the file in FormData with compressed version
        fd.delete("logo_file")
        fd.append("logo_file", compressed, `logo-${Date.now()}.jpg`)
      } catch {
        // Use original if compression fails
        console.warn("Logo compression failed, using original")
      }
      setCompressing(false)
    }

    startTransition(async () => {
      const result = await updateRestaurantSettingsAction(fd)
      if (result?.error) {
        setError(result.error)
        setTimeout(() => setError(null), 5000) // Auto-hide after 5 seconds
        return
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000) // Show for 5 seconds
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Restaurant Settings"
        description="Configure your restaurant's identity, tax rates, and operating hours."
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]}
        actions={
          <Button type="submit" form="settings-form" size="sm" disabled={pending || compressing}>
            {(pending || compressing) ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {compressing ? "Compressing..." : pending ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      {success && (
        <div className="fixed top-20 right-6 z-50 min-w-[320px] rounded-lg border border-emerald-500/50 bg-white p-4 shadow-xl dark:bg-gray-950 dark:border-emerald-500/30 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-semibold" style={{ color: '#000000' }}>
                Settings saved
              </p>
              <p className="mt-0.5 text-xs" style={{ color: '#333333' }}>
                Your changes have been saved successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-20 right-6 z-50 min-w-[320px] rounded-lg border border-red-500/50 bg-white p-4 shadow-xl dark:bg-gray-950 dark:border-red-500/30 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
              <SettingsIcon className="size-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-semibold" style={{ color: '#000000' }}>
                Error saving settings
              </p>
              <p className="mt-0.5 text-xs" style={{ color: '#333333' }}>
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      <form id="settings-form" onSubmit={onSubmit} className="space-y-6">
        {/* Identity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              <CardTitle>Identity</CardTitle>
            </div>
            <CardDescription>How your restaurant appears to customers and on receipts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Restaurant name *</Label>
                <Input id="name" name="name" required defaultValue={s.name} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" name="tagline" defaultValue={s.tagline || ""} placeholder="Restaurant & Bar" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Restaurant Logo</Label>
              <div className="flex items-center gap-4">
                <div className="relative flex size-16 shrink-0 items-center justify-center rounded-md border bg-muted overflow-hidden">
                  {s.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img id="logo_preview" src={s.logo_url} alt="Logo" className="size-full object-contain" />
                  ) : (
                    <ImageIcon className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input type="hidden" name="logo_url" id="logo_url_hidden" value={s.logo_url || ""} />
                  <input
                    type="file"
                    id="logo_file"
                    name="logo_file"
                    accept="image/*"
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      const preview = document.getElementById("logo_preview")
                      const hidden = document.getElementById("logo_url_hidden") as HTMLInputElement
                      if (file && preview) {
                        const reader = new FileReader()
                        reader.onload = (ev) => {
                          if (preview.tagName === "IMG") {
                            (preview as HTMLImageElement).src = ev.target?.result as string
                          }
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">JPG, PNG, WebP or GIF • Auto-compressed to save space (max 5MB)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-muted-foreground" />
              <CardTitle>Contact</CardTitle>
            </div>
            <CardDescription>Contact details shown on receipts and customer-facing pages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="address" className="flex items-center gap-1.5">
                <MapPin className="size-3" />
                Address
              </Label>
              <Textarea
                id="address"
                name="address"
                rows={2}
                defaultValue={s.address || ""}
                placeholder="Street, City, ZIP"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="flex items-center gap-1.5">
                  <Phone className="size-3" />
                  Phone
                </Label>
                <Input id="phone" name="phone" type="tel" defaultValue={s.phone || ""} placeholder="+63 2 1234 5678" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="size-3" />
                  Email
                </Label>
                <Input id="email" name="email" type="email" defaultValue={s.email || ""} placeholder="hello@restaurant.com" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="tin" className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3" />
                  TIN / Tax ID
                </Label>
                <Input id="tin" name="tin" defaultValue={s.tin || ""} placeholder="000-000-000-000" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Percent className="size-4 text-muted-foreground" />
              <CardTitle>Financial</CardTitle>
            </div>
            <CardDescription>Currency and applicable charges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency symbol</Label>
                <Input id="currency" name="currency" defaultValue={s.currency} maxLength={4} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tax_rate">Tax rate (%)</Label>
                <Input
                  id="tax_rate"
                  name="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={s.tax_rate}
                />
                <p className="text-xs text-muted-foreground">Applied to order subtotals</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="service_charge">Service charge (%)</Label>
                <Input
                  id="service_charge"
                  name="service_charge"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={s.service_charge}
                />
                <p className="text-xs text-muted-foreground">Optional, for larger parties</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label htmlFor="receipt_footer" className="flex items-center gap-1.5">
                <Receipt className="size-3" />
                Receipt footer
              </Label>
              <Textarea
                id="receipt_footer"
                name="receipt_footer"
                rows={2}
                defaultValue={s.receipt_footer || ""}
                placeholder="e.g. Thank you for dining with us!"
              />
            </div>
          </CardContent>
        </Card>

        {/* Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <CardTitle>Operating Hours</CardTitle>
            </div>
            <CardDescription>Restaurant open and close times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="open_time">Open time</Label>
                <Input
                  id="open_time"
                  name="open_time"
                  type="time"
                  defaultValue={(s.open_time || "10:00:00").slice(0, 5)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="close_time">Close time</Label>
                <Input
                  id="close_time"
                  name="close_time"
                  type="time"
                  defaultValue={(s.close_time || "23:00:00").slice(0, 5)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bottom duplicate error removed since we now have toast */}

        <div className="flex items-center justify-end gap-3">
          <Badge variant="outline" className="text-xs">
            <SettingsIcon className="mr-1 size-3" />
            Last updated {new Date(s.updated_at).toLocaleString("en-PH")}
          </Badge>
          <Button type="submit" size="sm" disabled={pending || compressing}>
            {(pending || compressing) ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {compressing ? "Compressing..." : pending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
