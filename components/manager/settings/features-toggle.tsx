'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toggleFeature } from "@/app/actions/manager-settings"
import { toast } from "sonner"
import { ShoppingCart, Calendar, Clock } from "lucide-react"

interface FeaturesToggleProps {
  settings: any
}

export function FeaturesToggle({ settings }: FeaturesToggleProps) {
  const router = useRouter()
  const [features, setFeatures] = useState({
    enable_online_ordering: settings.enable_online_ordering ?? true,
    enable_event_booking: settings.enable_event_booking ?? true,
    enable_table_reservation: settings.enable_table_reservation ?? true,
  })

  const handleToggle = async (feature: string, enabled: boolean) => {
    // Optimistic update
    setFeatures({ ...features, [feature]: enabled })

    const { success, error } = await toggleFeature(feature, enabled)

    if (success) {
      toast.success(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`)
      router.refresh()
    } else {
      // Revert on error
      setFeatures({ ...features, [feature]: !enabled })
      toast.error(error || "Failed to update feature")
    }
  }

  const featuresList = [
    {
      key: 'enable_online_ordering',
      icon: ShoppingCart,
      title: 'Online Ordering',
      description: 'Allow customers to place orders online for delivery or pickup',
    },
    {
      key: 'enable_event_booking',
      icon: Calendar,
      title: 'Event Booking',
      description: 'Enable event booking system for customers to book venues and packages',
    },
    {
      key: 'enable_table_reservation',
      icon: Clock,
      title: 'Table Reservation',
      description: 'Allow customers to reserve tables for dine-in',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Toggles</CardTitle>
        <CardDescription>
          Enable or disable features on your landing page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {featuresList.map((feature) => {
          const Icon = feature.icon
          const isEnabled = features[feature.key as keyof typeof features]

          return (
            <div
              key={feature.key}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${
                  isEnabled 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  <Icon className={`size-5 ${
                    isEnabled 
                      ? 'text-green-600' 
                      : 'text-slate-400'
                  }`} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={feature.key} className="text-base font-semibold cursor-pointer">
                    {feature.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
              <Switch
                id={feature.key}
                checked={isEnabled}
                onCheckedChange={(checked) => handleToggle(feature.key, checked)}
              />
            </div>
          )
        })}

        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> Disabling a feature will hide it from the landing page but won't delete any existing data.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
