'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updateSettings } from "@/app/actions/manager-settings"
import { toast } from "sonner"

interface BusinessInfoFormProps {
  settings: any
}

export function BusinessInfoForm({ settings }: BusinessInfoFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    business_name: settings.business_name || '',
    tagline: settings.tagline || '',
    about_text: settings.about_text || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { success, error } = await updateSettings({
      id: settings.id,
      ...formData
    })

    if (success) {
      toast.success("Business information updated successfully")
      router.refresh()
    } else {
      toast.error(error || "Failed to update business information")
    }

    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>
          Update your business name, tagline, and about text
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              placeholder="Lydia's Lechon"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="60 Years of Bringing Filipino Flavors to Life"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about_text">About Text</Label>
            <Textarea
              id="about_text"
              value={formData.about_text}
              onChange={(e) => setFormData({ ...formData, about_text: e.target.value })}
              placeholder="Tell your story..."
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              This text will appear in the "Our Story" section
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
