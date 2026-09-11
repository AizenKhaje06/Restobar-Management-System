"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { OrderStatus, OrderType } from "@/lib/types"
import { getTaxRate } from "@/lib/settings"

// ============================================================
// CREATE ADDITIONAL ORDER (customer via QR menu)
// Goes DIRECTLY to kitchen (no approval needed)
// ============================================================
export async function createAdditionalOrder(input: {
  session_id: string
  table_id: string
  customer_name: string | null
  items: { menu_item_id: string; name: string; price: number; quantity: number; notes?: string }[]
  notes?: string | null
}) {
  const supabase = await createClient()

  if (!input.items.length) return { error: "Order must have at least one item" }

  // Find the initial order for this session to link to
  const { data: initialOrder } = await supabase
    .from("orders")
    .select("id, order_type")
    .eq("session_id", input.session_id)
    .eq("order_type", "initial")
    .single()

  if (!initialOrder) {
    return { error: "No initial order found for this session" }
  }

  const taxRate = await getTaxRate()
  const subtotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax = Math.round(subtotal * taxRate * 100) / 100
  const total = Math.round((subtotal + tax) * 100) / 100

  // Create the additional order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      table_id: input.table_id,
      session_id: input.session_id,
      session_token: input.session_id, // legacy field
      customer_name: input.customer_name,
      status: "confirmed" as OrderStatus, // Go directly to kitchen (skip pending)
      payment_status: "unpaid",
      subtotal,
      tax,
      total,
      notes: input.notes ?? null,
      order_type: "additional" as OrderType,
      parent_order_id: initialOrder.id,
      is_notified: false, // Staff will be notified
      created_by: null, // Customer order
    })
    .select()
    .single()

  if (orderErr) return { error: orderErr.message }

  // Insert order items
  const { error: itemsErr } = await supabase.from("order_items").insert(
    input.items.map((i) => ({
      order_id: order.id,
      menu_item_id: i.menu_item_id || null,
      name: i.name,
      unit_price: i.price,
      quantity: i.quantity,
      notes: i.notes ?? null,
      status: "confirmed" as OrderStatus, // Match order status
    }))
  )

  if (itemsErr) return { error: itemsErr.message }

  // Log activity
  await supabase.rpc("log_activity", {
    p_action: "order.additional_created",
    p_entity: "order",
    p_entity_id: order.id,
    p_detail: { 
      total, 
      item_count: input.items.length, 
      table: input.table_id,
      parent_order: initialOrder.id,
      customer: input.customer_name,
    },
  })

  revalidatePath("/order")
  revalidatePath("/waiter")
  revalidatePath("/pos")
  revalidatePath("/kitchen")
  
  return { success: true, order_id: order.id, order_number: order.order_number }
}

// ============================================================
// GET SESSION ORDERS (for customer view - all orders in session)
// ============================================================
export async function getSessionOrders(sessionId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      order_type,
      status,
      payment_status,
      subtotal,
      tax,
      total,
      created_at,
      order_items(id, name, unit_price, quantity, notes, status)
    `)
    .eq("session_id", sessionId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: true })

  if (error) return { error: error.message }

  return { orders: data ?? [] }
}

// ============================================================
// CHECK IF SESSION CAN ORDER MORE
// (session must have at least one non-cancelled order)
// ============================================================
export async function canSessionOrderMore(sessionId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, order_type")
    .eq("session_id", sessionId)
    .neq("status", "cancelled")
    .limit(1)

  if (error) return { canOrder: false, error: error.message }

  // Can order more if there's at least one active order
  const hasActiveOrder = data && data.length > 0
  const hasInitialOrder = data?.some(o => o.order_type === "initial")

  return { 
    canOrder: hasActiveOrder && hasInitialOrder,
    message: !hasActiveOrder 
      ? "No active orders found"
      : !hasInitialOrder
      ? "Initial order not found"
      : "Ready to order more"
  }
}

// ============================================================
// GET MENU FOR CUSTOMER (categories + available items)
// ============================================================
export async function getCustomerMenu() {
  const supabase = await createClient()

  const [categories, menuItems] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("name"),
  ])

  return {
    categories: categories.data ?? [],
    menuItems: menuItems.data ?? [],
  }
}

// ============================================================
// MARK ADDITIONAL ORDER AS NOTIFIED
// (called when staff acknowledges the notification)
// ============================================================
export async function markAdditionalOrderNotified(orderId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("orders")
    .update({ is_notified: true })
    .eq("id", orderId)

  if (error) return { error: error.message }

  return { success: true }
}

// ============================================================
// GET UNNOTIFIED ADDITIONAL ORDERS (for staff notifications)
// ============================================================
export async function getUnnotifiedAdditionalOrders() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      order_type,
      status,
      total,
      customer_name,
      created_at,
      tables(label, zone),
      order_items(name, quantity)
    `)
    .eq("order_type", "additional")
    .eq("is_notified", false)
    .in("status", ["confirmed", "preparing", "ready"])
    .order("created_at", { ascending: true })

  if (error) return { error: error.message }

  return { orders: data ?? [] }
}
