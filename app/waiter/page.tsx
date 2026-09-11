import { redirect } from "next/navigation"
import { getSessionProfile } from "@/lib/auth"
import { getWaiterOrders } from "@/app/actions/waiter"
import { getRestaurantSettings } from "@/lib/settings"
import { WaiterOrdersClient } from "@/components/dashboard/waiter-orders-client"
import type { Profile } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function WaiterPage() {
  const session = await getSessionProfile()
  if (!session) {
    redirect("/login")
    return
  }
  if (session.role !== "waiter") {
    redirect("/")
    return
  }
  const profile = session as Profile

  const [{ orders }, settings] = await Promise.all([
    getWaiterOrders(),
    getRestaurantSettings(),
  ])

  return (
    <WaiterOrdersClient 
      profile={profile} 
      initialOrders={orders ?? []}
      restaurantName={settings?.name || "Lydias Lechon"}
      restaurantLogo={settings?.logo_url ?? undefined}
    />
  )
}