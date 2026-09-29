'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updateHeroSection } from "@/app/actions/manager-settings"
import { toast } from "sonner"
import { Image, Video } from "lucide-react"

interface HeroSectionFormProps {
  settings: any
}

export function HeroSectionForm({ settings }: HeroSectionFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    hero_title: settings.hero_title || '',
    hero_subtitle: settings.hero_subtitle || '',
    hero_image_url: settings.hero_image_url || '',
    hero_video_url: settings.hero_video_url || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { success, error } = await updateHeroSection(formData)

    if (success) {
      toast.success("Hero section updated successfully")
      router.refresh()
    } else {
      toast.error(error || "Failed to update hero section")
    }

    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Section</CardTitle>
        <CardDescription>
          Customize the main hero section on your landing page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero_title">Hero Title</Label>
            <Input
              id="hero_title"
              value={formData.hero_title}
              onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
              placeholder="Experience Authentic Filipino Flavors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
            <Textarea
              id="hero_subtitle"
              value={formData.hero_subtitle}
              onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
              placeholder="60 years of tradition, passion, and excellence"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_image_url" className="flex items-center gap-2">
              <Image className="size-4" />
              Hero Image URL
            </Label>
            <Input
              id="hero_image_url"
              type="url"
              value={formData.hero_image_url}
              onChange={(e) => setFormData({ ...formData, hero_image_url: e.target.value })}
              placeholder="/hero-image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Upload image to /public folder and reference it here
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_video_url" className="flex items-center gap-2">
              <Video className="size-4" />
              Hero Video URL (Optional)
            </Label>
            <Input
              id="hero_video_url"
              type="url"
              value={formData.hero_video_url}
              onChange={(e) => setFormData({ ...formData, hero_video_url: e.target.value })}
              placeholder="https://youtube.com/embed/..."
            />
            <p className="text-xs text-muted-foreground">
              YouTube embed URL for video hero
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
