'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type OrderFilters = {
  status?: string
  orderType?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Get all orders with filters
export async function getOrders(filters?: OrderFilters) {
  const supabase = await createClient()

  let query = supabase
    .from("online_orders")
    .select(`
      *,
      event_customers (
        id,
        full_name,
        email,
        phone
      )
    `)
    .order("created_at", { ascending: false })

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.orderType) {
    query = query.eq("order_type", filters.orderType)
  }

  if (filters?.dateFrom) {
    query = query.gte("created_at", filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte("created_at", filters.dateTo)
  }

  if (filters?.search) {
    query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching orders:", error)
    return { orders: [], error: error.message }
  }

  return { orders: data || [], error: null }
}

// Get single order by ID
export async function getOrderById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("online_orders")
    .select(`
      *,
      event_customers (
        id,
        full_name,
        email,
        phone
      ),
      assigned_user:users!assigned_to (
        id,
        full_name
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching order:", error)
    return { order: null, error: error.message }
  }

  return { order: data, error: null }
}

// Update order status
export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient()

  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  }

  // Set timestamp based on status
  if (status === 'confirmed') {
    updateData.confirmed_at = new Date().toISOString()
  } else if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  } else if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from("online_orders")
    .update(updateData)
    .eq("id", id)

  if (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/orders")
  return { success: true, error: null }
}

// Assign order to staff
export async function assignOrder(orderId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("online_orders")
    .update({
      assigned_to: userId,
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId)

  if (error) {
    console.error("Error assigning order:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/orders")
  return { success: true, error: null }
}

// Cancel order with reason
export async function cancelOrder(id: string, reason: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("online_orders")
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    console.error("Error cancelling order:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/orders")
  return { success: true, error: null }
}

// Update payment status
export async function updatePaymentStatus(id: string, paymentStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("online_orders")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating payment status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/orders")
  return { success: true, error: null }
}

// Get order statistics
export async function getOrderStats(dateFrom?: string, dateTo?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("online_orders")
    .select("status, total_amount, created_at")

  if (dateFrom) {
    query = query.gte("created_at", dateFrom)
  }

  if (dateTo) {
    query = query.lte("created_at", dateTo)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching order stats:", error)
    return {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      error: error.message
    }
  }

  const stats = {
    totalOrders: data?.length || 0,
    totalRevenue: data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
    pendingOrders: data?.filter(o => o.status === 'pending').length || 0,
    completedOrders: data?.filter(o => o.status === 'completed').length || 0,
    error: null
  }

  return stats
}

// Get available staff for assignment
export async function getAvailableStaff() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, role")
    .in("role", ["admin", "landing_page_manager", "waiter"])
    .eq("is_active", true)
    .order("full_name")

  if (error) {
    console.error("Error fetching staff:", error)
    return { staff: [], error: error.message }
  }

  return { staff: data || [], error: null }
}
