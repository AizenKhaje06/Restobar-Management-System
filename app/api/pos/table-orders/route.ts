import { NextResponse } from "next/server"
import { getSessionProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const profile = await getSessionProfile()
  if (!profile || (profile.role !== "pos" && profile.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const tableId = url.searchParams.get("table_id")
  if (!tableId) {
    return NextResponse.json({ error: "table_id required" }, { status: 400 })
  }

  const supabase = await createClient()

  // Get active session for this table
  const { data: session } = await supabase
    .from("table_sessions")
    .select("id")
    .eq("table_id", tableId)
    .eq("status", "active")
    .maybeSingle()

  // Get all unpaid orders for this table (excluding cancelled orders)
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, table_id, session_id, customer_name, status, payment_status, subtotal, tax, total, created_at, order_type, order_items(id, name, unit_price, quantity, menu_item_id, menu_items(image_url))")
    .eq("table_id", tableId)
    .in("payment_status", ["unpaid", "pending"])
    .neq("status", "cancelled") // Exclude cancelled orders
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform data to flatten image_url from menu_items into order_items
  const transformedOrders = (orders ?? []).map((order) => ({
    ...order,
    order_items: (order.order_items ?? []).map((item: any) => ({
      id: item.id,
      name: item.name,
      unit_price: item.unit_price,
      quantity: item.quantity,
      image_url: item.menu_items?.image_url ?? null,
    })),
  }))

  return NextResponse.json({ orders: transformedOrders })
}
