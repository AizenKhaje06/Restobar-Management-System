import { redirect } from "next/navigation"
import { getSessionProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PosTablesClient } from "@/components/dashboard/pos-tables-client"

export const dynamic = "force-dynamic"

export default async function PosTablesPage() {
  const profile = await getSessionProfile()
  if (!profile) redirect("/login")
  if (profile.role !== "pos") redirect("/")

  const supabase = await createClient()

  // Get all tables
  const { data: tables } = await supabase
    .from("tables")
    .select("*")
    .order("label")

  // Get all active sessions with their most recent order status
  const { data: sessions } = await supabase
    .from("table_sessions")
    .select(`
      id, 
      table_id, 
      customer_name, 
      created_at, 
      status,
      orders!inner(status)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false, foreignTable: "orders" })
    .limit(1, { foreignTable: "orders" })

  // Transform the data to include order_status at the top level
  const sessionsWithOrderStatus = (sessions ?? []).map((session: any) => ({
    id: session.id,
    table_id: session.table_id,
    customer_name: session.customer_name,
    created_at: session.created_at,
    status: session.status,
    order_status: session.orders?.[0]?.status ?? null,
  }))

  return (
    <PosTablesClient
      profile={profile}
      tables={tables ?? []}
      sessions={sessionsWithOrderStatus}
    />
  )
}
