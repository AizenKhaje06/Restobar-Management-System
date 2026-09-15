import { redirect } from "next/navigation"
import { getSessionProfile } from "@/lib/auth"
import { getRestaurantSettings } from "@/lib/settings"
import { createClient } from "@/lib/supabase/server"
import { PosOrdersClient } from "@/components/dashboard/pos-orders-client"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default async function PosOrdersPage() {
  const profile = await getSessionProfile()

  if (!profile) {
    redirect("/login")
    return // prevent TS from complaining
  }
  if (profile.role !== "pos") {
    redirect("/")
    return
  }

  const supabase = await createClient()

  const [{ data: orders }, settings] = await Promise.all([
    supabase
      .from("orders")
      .select(
        `
        *,
        order_items(*, menu_items(image_url)),
        tables(label, zone)
      `
      )
      .in("status", ["pending", "confirmed", "preparing", "ready", "served"])
      .order("created_at", { ascending: false })
      .limit(50),
    getRestaurantSettings(),
  ])

  // Transform data to flatten image_url from menu_items into order_items
  const transformedOrders = (orders ?? []).map((order) => ({
    ...order,
    order_items: (order.order_items ?? []).map((item: any) => ({
      ...item,
      image_url: item.menu_items?.image_url ?? null,
      menu_items: undefined, // Remove nested object
    })),
  }))

  // Filter out any orders with null status (defensive)
  const safeOrders = transformedOrders.filter((o) => o.status !== null)

  return (
    <ErrorBoundary>
      <PosOrdersClient 
        profile={profile} 
        initialOrders={safeOrders}
        restaurantName={settings?.name}
        restaurantLogo={settings?.logo_url ?? undefined}
      />
    </ErrorBoundary>
  )
}