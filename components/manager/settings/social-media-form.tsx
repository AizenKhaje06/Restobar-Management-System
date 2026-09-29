'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { updateSocialMedia } from "@/app/actions/manager-settings"
import { toast } from "sonner"
import { Link } from "lucide-react"

interface SocialMediaFormProps {
  settings: any
}

export function SocialMediaForm({ settings }: SocialMediaFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    facebook_url: settings.facebook_url || '',
    instagram_url: settings.instagram_url || '',
    twitter_url: settings.twitter_url || '',
    youtube_url: settings.youtube_url || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { success, error } = await updateSocialMedia(formData)

    if (success) {
      toast.success("Social media links updated successfully")
      router.refresh()
    } else {
      toast.error(error || "Failed to update social media links")
    }

    setSaving(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>
          Add your social media profiles to appear on the landing page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facebook_url" className="flex items-center gap-2">
              <Link className="size-4" />
              Facebook
            </Label>
            <Input
              id="facebook_url"
              type="url"
              value={formData.facebook_url}
              onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
              placeholder="https://facebook.com/lydiaslechon"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram_url" className="flex items-center gap-2">
              <Link className="size-4" />
              Instagram
            </Label>
            <Input
              id="instagram_url"
              type="url"
              value={formData.instagram_url}
              onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
              placeholder="https://instagram.com/lydiaslechon"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter_url" className="flex items-center gap-2">
              <Link className="size-4" />
              Twitter / X
            </Label>
            <Input
              id="twitter_url"
              type="url"
              value={formData.twitter_url}
              onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
              placeholder="https://twitter.com/lydiaslechon"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube_url" className="flex items-center gap-2">
              <Link className="size-4" />
              YouTube
            </Label>
            <Input
              id="youtube_url"
              type="url"
              value={formData.youtube_url}
              onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
              placeholder="https://youtube.com/@lydiaslechon"
            />
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
