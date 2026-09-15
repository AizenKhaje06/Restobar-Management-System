"use server"

import { createClient } from "@/lib/supabase/server"
import { getSessionProfile } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export interface PosCashflowSummary {
  // Current shift summary
  shiftStart: string | null
  cashSales: number
  cardSales: number
  gcashSales: number
  mayaSales: number
  totalSales: number
  transactionCount: number
  cashTransactionCount: number
  
  // Recent transactions
  recentTransactions: {
    id: string
    order_number: number
    created_at: string
    customer_name: string | null
    payment_method: string
    amount: number
    table_label: string | null
  }[]
  
  // Remittance history
  remittances: {
    id: string
    remittance_number: number
    cash_amount: number
    declared_amount: number
    variance: number
    status: string
    shift_start_at: string
    shift_end_at: string
    received_by_name: string | null
    admin_notes: string | null
    created_at: string
  }[]
}

/**
 * Get POS staff's current shift cashflow summary
 */
export async function getPosCashflowSummary(params?: {
  startDate?: string
  endDate?: string
}): Promise<{ data?: PosCashflowSummary; error?: string }> {
  const supabase = await createClient()
  const profile = await getSessionProfile()

  if (!profile || (profile.role !== "pos" && profile.role !== "admin")) {
    return { error: "Unauthorized" }
  }

  const { startDate, endDate } = params || {}

  try {
    // Determine shift start (default: today at 00:00 or last remittance)
    let shiftStart = startDate || new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
    
    // Get last remittance for this user
    const { data: lastRemittance } = await supabase
      .from("cash_remittances")
      .select("shift_end_at")
      .eq("remitted_by", profile.id)
      .order("shift_end_at", { ascending: false })
      .limit(1)
      .single()
    
    if (lastRemittance?.shift_end_at) {
      shiftStart = lastRemittance.shift_end_at
    }

    // Get all paid orders in the period
    let ordersQuery = supabase
      .from("orders")
      .select(`
        id,
        order_number,
        created_at,
        customer_name,
        total,
        tables(label),
        payments(method, amount, status, processed_by)
      `)
      .eq("payment_status", "paid")
      .gte("created_at", shiftStart)

    if (endDate) {
      ordersQuery = ordersQuery.lte("created_at", endDate)
    }

    // For POS users, only show their own transactions
    // Admin can see all
    if (profile.role === "pos") {
      ordersQuery = ordersQuery.eq("payments.processed_by", profile.id)
    }

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      return { error: ordersError.message }
    }

    // Calculate breakdown by payment method
    let cashSales = 0
    let cardSales = 0
    let gcashSales = 0
    let mayaSales = 0
    let totalSales = 0
    let transactionCount = 0
    let cashTransactionCount = 0

    const recentTransactions: PosCashflowSummary["recentTransactions"] = []

    for (const order of orders || []) {
      const payment = (order.payments as any)?.[0]
      if (!payment || payment.status !== "paid") continue

      // For POS, filter by their processed payments
      if (profile.role === "pos" && payment.processed_by !== profile.id) {
        continue
      }

      const amount = payment.amount || order.total
      
      switch (payment.method) {
        case "cash":
          cashSales += amount
          cashTransactionCount++
          break
        case "card":
          cardSales += amount
          break
        case "gcash":
          gcashSales += amount
          break
        case "maya":
          mayaSales += amount
          break
      }

      totalSales += amount
      transactionCount++

      recentTransactions.push({
        id: order.id,
        order_number: order.order_number,
        created_at: order.created_at,
        customer_name: order.customer_name,
        payment_method: payment.method,
        amount: amount,
        table_label: (order.tables as any)?.label || null,
      })
    }

    // Sort recent transactions by date descending
    recentTransactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Get remittance history
    let remittanceQuery = supabase
      .from("cash_remittances")
      .select(`
        id,
        remittance_number,
        cash_amount,
        declared_amount,
        variance,
        status,
        shift_start_at,
        shift_end_at,
        admin_notes,
        created_at,
        receiver:received_by(full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    if (profile.role === "pos") {
      remittanceQuery = remittanceQuery.eq("remitted_by", profile.id)
    }

    const { data: remittances } = await remittanceQuery

    const formattedRemittances = (remittances || []).map((r: any) => ({
      id: r.id,
      remittance_number: r.remittance_number,
      cash_amount: r.cash_amount,
      declared_amount: r.declared_amount,
      variance: r.variance,
      status: r.status,
      shift_start_at: r.shift_start_at,
      shift_end_at: r.shift_end_at,
      received_by_name: r.receiver?.full_name || null,
      admin_notes: r.admin_notes,
      created_at: r.created_at,
    }))

    return {
      data: {
        shiftStart,
        cashSales: Math.round(cashSales * 100) / 100,
        cardSales: Math.round(cardSales * 100) / 100,
        gcashSales: Math.round(gcashSales * 100) / 100,
        mayaSales: Math.round(mayaSales * 100) / 100,
        totalSales: Math.round(totalSales * 100) / 100,
        transactionCount,
        cashTransactionCount,
        recentTransactions: recentTransactions.slice(0, 50), // Limit to 50 most recent
        remittances: formattedRemittances,
      },
    }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Submit cash remittance to admin
 */
export async function submitCashRemittance(params: {
  declaredAmount: number
  shiftStartAt: string
  shiftEndAt: string
  posNotes?: string
}): Promise<{ data?: { id: string; remittance_number: number }; error?: string }> {
  const supabase = await createClient()
  const profile = await getSessionProfile()

  if (!profile || (profile.role !== "pos" && profile.role !== "admin")) {
    return { error: "Unauthorized" }
  }

  const { declaredAmount, shiftStartAt, shiftEndAt, posNotes } = params

  try {
    // Calculate actual cash collected in this period
    const { data: orders } = await supabase
      .from("orders")
      .select(`
        total,
        payments!inner(method, amount, status, processed_by)
      `)
      .eq("payment_status", "paid")
      .eq("payments.status", "paid")
      .eq("payments.method", "cash")
      .eq("payments.processed_by", profile.id)
      .gte("created_at", shiftStartAt)
      .lte("created_at", shiftEndAt)

    let actualCash = 0
    let cashTransactions = 0

    for (const order of orders || []) {
      const payment = (order.payments as any)?.[0]
      if (payment?.method === "cash" && payment.status === "paid") {
        actualCash += payment.amount || order.total
        cashTransactions++
      }
    }

    // Get other payment methods for reference
    const { data: allOrders } = await supabase
      .from("orders")
      .select(`
        total,
        payments!inner(method, amount, status, processed_by)
      `)
      .eq("payment_status", "paid")
      .eq("payments.status", "paid")
      .eq("payments.processed_by", profile.id)
      .gte("created_at", shiftStartAt)
      .lte("created_at", shiftEndAt)

    let cardAmount = 0
    let gcashAmount = 0
    let mayaAmount = 0
    let totalTransactions = 0

    for (const order of allOrders || []) {
      const payment = (order.payments as any)?.[0]
      if (!payment || payment.status !== "paid") continue

      totalTransactions++
      const amount = payment.amount || order.total

      if (payment.method === "card") cardAmount += amount
      if (payment.method === "gcash") gcashAmount += amount
      if (payment.method === "maya") mayaAmount += amount
    }

    // Create remittance record
    const { data: remittance, error: insertError } = await supabase
      .from("cash_remittances")
      .insert({
        remitted_by: profile.id,
        cash_amount: Math.round(actualCash * 100) / 100,
        declared_amount: Math.round(declaredAmount * 100) / 100,
        total_transactions: totalTransactions,
        cash_transactions: cashTransactions,
        card_amount: Math.round(cardAmount * 100) / 100,
        gcash_amount: Math.round(gcashAmount * 100) / 100,
        maya_amount: Math.round(mayaAmount * 100) / 100,
        shift_start_at: shiftStartAt,
        shift_end_at: shiftEndAt,
        pos_notes: posNotes || null,
        status: Math.abs(actualCash - declaredAmount) > 0.01 ? "discrepancy" : "pending",
      })
      .select("id, remittance_number")
      .single()

    if (insertError) {
      return { error: insertError.message }
    }

    revalidatePath("/pos/cashflow")
    return { data: remittance }
  } catch (error: any) {
    return { error: error.message }
  }
}

/**
 * Admin: Verify remittance
 */
export async function verifyRemittance(params: {
  remittanceId: string
  status: "verified" | "discrepancy"
  adminNotes?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const profile = await getSessionProfile()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized - Admin only" }
  }

  const { remittanceId, status, adminNotes } = params

  try {
    const { error: updateError } = await supabase
      .from("cash_remittances")
      .update({
        status,
        admin_notes: adminNotes || null,
        received_by: profile.id,
      })
      .eq("id", remittanceId)

    if (updateError) {
      return { error: updateError.message }
    }

    revalidatePath("/pos/cashflow")
    revalidatePath("/admin/cashflow")
    return {}
  } catch (error: any) {
    return { error: error.message }
  }
}
