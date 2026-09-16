import { createClient } from "@/lib/supabase/server"
import type { ActivityLog } from "@/lib/types"

/**
 * Get activity logs filtered by staff member (actor_id)
 * This shows only activities performed by the logged-in POS staff
 */
export async function getStaffActivityLogs(staffId: string, limit = 50) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activity_logs")
    .select(`
      *,
      actor:profiles!activity_logs_actor_id_fkey(id, full_name, email, role)
    `)
    .eq("actor_id", staffId)
    .order("created_at", { ascending: false })
    .limit(limit)
  
  if (error) return []
  
  // Enhance activity logs with additional context
  const enhancedLogs = await Promise.all((data ?? []).map(async (log) => {
    const detail = log.detail as Record<string, any> | null
    let enhancedDetail = detail ? { ...detail } : {}
    
    // Add table information for table-related activities
    if (log.entity === "table" && log.entity_id && !enhancedDetail.table_label) {
      const { data: table } = await supabase
        .from("tables")
        .select("label, capacity, status")
        .eq("id", log.entity_id)
        .single()
      
      if (table) {
        enhancedDetail = { ...enhancedDetail, table_label: table.label, capacity: table.capacity, status: table.status }
      }
    }
    
    // Add order details for order-related activities
    if (log.entity === "order" && log.entity_id) {
      const { data: order } = await supabase
        .from("orders")
        .select(`
          order_number,
          total,
          status,
          payment_status,
          customer_name,
          table:tables(label)
        `)
        .eq("id", log.entity_id)
        .single()
      if (order) {
        enhancedDetail = {
          ...enhancedDetail,
          order_number: order.order_number,
          total: order.total,
          status: order.status,
          payment_status: order.payment_status,
          customer_name: order.customer_name,
          table_label: order.table?.label || enhancedDetail.table_label
        }
      }
    }
    
    // Add table_session details for session-related activities
    if (log.entity === "table_session" && log.entity_id) {
      const { data: session } = await supabase
        .from("table_sessions")
        .select(`
          customer_name,
          guests,
          status,
          table_id,
          table:tables(label)
        `)
        .eq("id", log.entity_id)
        .single()
      
      if (session) {
        enhancedDetail = {
          ...enhancedDetail,
          customer_name: enhancedDetail.customer_name || session.customer_name,
          guests: enhancedDetail.guests || session.guests,
          status: session.status,
          table_label: session.table?.label || enhancedDetail.table_label
        }
      }
    }
    
    // Add payment details
    if (log.entity === "payment" && log.entity_id) {
      const { data: payment } = await supabase
        .from("payments")
        .select(`
          amount,
          method,
          status,
          order:orders(order_number, table:tables(label))
        `)
        .eq("id", log.entity_id)
        .single()
      if (payment) {
        enhancedDetail = {
          ...enhancedDetail,
          amount: payment.amount,
          method: payment.method,
          payment_status: payment.status,
          order_number: payment.order?.order_number,
          table_label: payment.order?.table?.label || enhancedDetail.table_label
        }
      }
    }
    
    return {
      ...log,
      actor_name: log.actor?.full_name || log.actor?.email || "System",
      actor_role: log.actor?.role,
      detail: enhancedDetail
    } as ActivityLog
  }))
  
  return enhancedLogs
}
