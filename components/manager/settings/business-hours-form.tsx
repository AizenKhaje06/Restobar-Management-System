'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateBusinessHours } from "@/app/actions/manager-settings"
import { toast } from "sonner"
import { Clock } from "lucide-react"

interface BusinessHoursFormProps {
  settings: any
}

const defaultHours = {
  monday: { open: "10:00", close: "22:00", closed: false },
  tuesday: { open: "10:00", close: "22:00", closed: false },
  wednesday: { open: "10:00", close: "22:00", closed: false },
  thursday: { open: "10:00", close: "22:00", closed: false },
  friday: { open: "10:00", close: "22:00", closed: false },
  saturday: { open: "10:00", close: "23:00", closed: false },
  sunday: { open: "10:00", close: "21:00", closed: false },
}

export function BusinessHoursForm({ settings }: BusinessHoursFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [hours, setHours] = useState(settings.business_hours || defaultHours)

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { success, error } = await updateBusinessHours(hours)

    if (success) {
      toast.success("Business hours updated successfully")
      router.refresh()
    } else {
      toast.error(error || "Failed to update business hours")
    }

    setSaving(false)
  }

  const updateDay = (day: string, field: string, value: any) => {
    setHours({
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5" />
          Business Hours
        </CardTitle>
        <CardDescription>
          Set your operating hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {days.map((day) => (
            <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="min-w-28">
                <Label className="capitalize font-semibold">{day}</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={!hours[day]?.closed}
                  onCheckedChange={(checked) => updateDay(day, 'closed', !checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {hours[day]?.closed ? 'Closed' : 'Open'}
                </span>
              </div>

              {!hours[day]?.closed && (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${day}-open`} className="text-sm">Open:</Label>
                    <Input
                      id={`${day}-open`}
                      type="time"
                      value={hours[day]?.open || '10:00'}
                      onChange={(e) => updateDay(day, 'open', e.target.value)}
                      className="w-32"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${day}-close`} className="text-sm">Close:</Label>
                    <Input
                      id={`${day}-close`}
                      type="time"
                      value={hours[day]?.close || '22:00'}
                      onChange={(e) => updateDay(day, 'close', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </>
              )}
            </div>
          ))}

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
