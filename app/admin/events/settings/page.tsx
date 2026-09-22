"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Share2,
  Globe,
  Building2
} from "lucide-react"

export default function EventSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [settings, setSettings] = useState({
    businessName: "Lumière Events",
    phone: "+63 917 123 4567",
    email: "events@restaurant.com",
    address: "123 Main Street, Manila, Philippines 1000",
    hours: "Monday - Sunday, 8:00 AM - 10:00 PM",
    facebook: "https://facebook.com/lumiereevents",
    instagram: "https://instagram.com/lumiereevents",
    website: "https://yourdomain.com",
    description: "Premier event venue in Manila offering stunning spaces for weddings, corporate events, and celebrations.",
    whatsapp: "+63 917 123 4567",
    googleMapsUrl: "https://www.google.com/maps/embed?pb=!1m18...",
  })

  const handleSave = async () => {
    setSaving(true)
    // TODO: Implement save to database or config file
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Website Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage contact information and business details displayed on your public website
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 flex items-center gap-2">
          <Save className="size-5" />
          <span className="font-medium">Settings saved successfully!</span>
        </div>
      )}

      {/* Business Information */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="size-5 text-amber-600" />
          <h2 className="text-xl font-bold">Business Information</h2>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Business Name</label>
          <Input
            value={settings.businessName}
            onChange={(e) => setSettings({...settings, businessName: e.target.value})}
            placeholder="Your Business Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={settings.description}
            onChange={(e) => setSettings({...settings, description: e.target.value})}
            placeholder="Brief description of your business"
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This appears in meta descriptions and about sections
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Contact Information</h2>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Phone className="size-4" />
            Phone Number
          </label>
          <Input
            value={settings.phone}
            onChange={(e) => setSettings({...settings, phone: e.target.value})}
            placeholder="+63 917 123 4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Phone className="size-4" />
            WhatsApp Number
          </label>
          <Input
            value={settings.whatsapp}
            onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
            placeholder="+63 917 123 4567"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This is used for the WhatsApp floating button
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Mail className="size-4" />
            Email Address
          </label>
          <Input
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({...settings, email: e.target.value})}
            placeholder="events@restaurant.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <MapPin className="size-4" />
            Physical Address
          </label>
          <Textarea
            value={settings.address}
            onChange={(e) => setSettings({...settings, address: e.target.value})}
            placeholder="123 Main Street, Manila, Philippines"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Clock className="size-4" />
            Operating Hours
          </label>
          <Input
            value={settings.hours}
            onChange={(e) => setSettings({...settings, hours: e.target.value})}
            placeholder="Monday - Sunday, 8:00 AM - 10:00 PM"
          />
        </div>
      </div>

      {/* Social Media */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Social Media Links</h2>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Share2 className="size-4" />
            Facebook Page URL
          </label>
          <Input
            value={settings.facebook}
            onChange={(e) => setSettings({...settings, facebook: e.target.value})}
            placeholder="https://facebook.com/yourpage"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Share2 className="size-4" />
            Instagram Profile URL
          </label>
          <Input
            value={settings.instagram}
            onChange={(e) => setSettings({...settings, instagram: e.target.value})}
            placeholder="https://instagram.com/yourprofile"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Globe className="size-4" />
            Website URL
          </label>
          <Input
            value={settings.website}
            onChange={(e) => setSettings({...settings, website: e.target.value})}
            placeholder="https://yourdomain.com"
          />
        </div>
      </div>

      {/* Google Maps */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Google Maps Integration</h2>

        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <MapPin className="size-4" />
            Google Maps Embed URL
          </label>
          <Textarea
            value={settings.googleMapsUrl}
            onChange={(e) => setSettings({...settings, googleMapsUrl: e.target.value})}
            placeholder="https://www.google.com/maps/embed?pb=..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Get this from Google Maps → Share → Embed a map → Copy HTML code (src attribute only)
          </p>
        </div>

        {/* Preview */}
        <div>
          <p className="text-sm font-medium mb-2">Preview:</p>
          <div className="rounded-lg overflow-hidden h-64 bg-muted">
            <iframe
              src={settings.googleMapsUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100">
        <p className="text-sm">
          <strong>Note:</strong> These settings will be displayed on your public event website 
          (Contact page, Footer, etc.). Make sure all information is accurate and up-to-date.
        </p>
      </div>
    </div>
  )
}
