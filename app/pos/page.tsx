import { redirect } from "next/navigation"
import { getSessionProfile } from "@/lib/auth"
import { getRestaurantSettings } from "@/lib/settings"
import { PosDashboard } from "@/components/dashboard/pos-dashboard"

export default async function PosPage() {
  const profile = await getSessionProfile()
  if (!profile) {
    redirect("/login")
    return
  }
  if (profile.role !== "pos") {
    redirect("/")
    return
  }

  const settings = await getRestaurantSettings()

  return (
    <PosDashboard 
      profile={profile}
      restaurantName={settings?.name}
      restaurantLogo={settings?.logo_url ?? undefined}
    />
  )
}