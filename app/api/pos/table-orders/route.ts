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

  // Get all unpaid orders for this table (including add-ons from any session)
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, table_id, session_id, customer_name, status, payment_status, subtotal, tax, total, created_at, order_type, order_items(id, name, unit_price, quantity)")
    .eq("table_id", tableId)
    .in("payment_status", ["unpaid", "pending"])
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ orders: orders ?? [] })
}
