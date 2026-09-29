import { getSettings } from "@/app/actions/manager-settings"
import { SettingsTabs } from "@/components/manager/settings-tabs"
import { Card } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default async function SettingsPage() {
  const { settings, error } = await getSettings()

  if (error || !settings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Landing Page Settings</h1>
          <p className="text-muted-foreground">
            Configure your landing page content and settings
          </p>
        </div>
        <Card className="p-6">
          <p className="text-center text-red-600">
            Error loading settings: {error || "Settings not found"}
          </p>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Please run the database migration to create the settings table.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="size-8" />
            Landing Page Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your landing page content, business information, and features
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <SettingsTabs settings={settings} />
    </div>
  )
}
