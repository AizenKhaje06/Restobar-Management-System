"use server"

import { createClient } from "@/lib/supabase/server"
import { getSessionProfile } from "@/lib/auth"

export interface CashflowData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  totalOrders: number
  averageOrderValue: number
  paymentMethodBreakdown: {
    method: string
    amount: number
    count: number
  }[]
  revenueByDay: {
    date: string
    revenue: number
    expenses: number
    profit: number
    orders: number
  }[]
  topSellingItems: {
    name: string
    quantity: number
    revenue: number
  }[]
  transactions: {
    id: string
    order_number: number
    created_at: string
    customer_name: string | null
    payment_method: string
    amount: number
    status: string
    table_label: string | null
  }[]
  expensesByCategory: {
    category: string
    amount: number
    count: number
  }[]
}

export async function getCashflowData(params: {
  startDate?: string
  endDate?: string
  paymentMethod?: string
}): Promise<{ data?: CashflowData; error?: string }> {
  const supabase = await createClient()
  const profile = await getSessionProfile()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const { startDate, endDate, paymentMethod } = params

  try {
    // Build date range filter
    let ordersQuery = supabase
      .from("orders")
      .select(`
        id,
        order_number,
        created_at,
        customer_name,
        total,
        subtotal,
        tax,
        status,
        payment_status,
        tables(label),
        payments(method, amount, status)
      `)
      .eq("payment_status", "paid")

    if (startDate) {
      ordersQuery = ordersQuery.gte("created_at", startDate)
    }
    if (endDate) {
      ordersQuery = ordersQuery.lte("created_at", endDate)
    }

    const { data: orders, error: ordersError } = await ordersQuery

    if (ordersError) {
      return { error: ordersError.message }
    }

    // Filter by payment method if specified
    let filteredOrders = orders || []
    if (paymentMethod && paymentMethod !== "all") {
      filteredOrders = filteredOrders.filter((order) =>
        order.payments?.some((p: any) => p.method === paymentMethod)
      )
    }

    // Calculate total revenue and order count
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total), 0)
    const totalOrders = filteredOrders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Payment method breakdown
    const paymentMethodMap = new Map<string, { amount: number; count: number }>()
    filteredOrders.forEach((order) => {
      order.payments?.forEach((payment: any) => {
        const method = payment.method || "unknown"
        const current = paymentMethodMap.get(method) || { amount: 0, count: 0 }
        paymentMethodMap.set(method, {
          amount: current.amount + Number(payment.amount),
          count: current.count + 1,
        })
      })
    })
    const paymentMethodBreakdown = Array.from(paymentMethodMap.entries()).map(
      ([method, data]) => ({
        method,
        amount: data.amount,
        count: data.count,
      })
    )

    // Revenue by day
    const revenueByDayMap = new Map<string, { revenue: number; orders: number }>()
    filteredOrders.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0]
      const current = revenueByDayMap.get(date) || { revenue: 0, orders: 0 }
      revenueByDayMap.set(date, {
        revenue: current.revenue + Number(order.total),
        orders: current.orders + 1,
      })
    })

    // Fetch expenses for the same date range
    let expensesQuery = supabase.from("expenses").select("date, category, amount")

    if (startDate) {
      expensesQuery = expensesQuery.gte("date", startDate.split("T")[0])
    }
    if (endDate) {
      expensesQuery = expensesQuery.lte("date", endDate.split("T")[0])
    }

    const { data: expenses } = await expensesQuery
    const totalExpenses = (expenses || []).reduce((sum, exp) => sum + Number(exp.amount), 0)

    // Add expenses to revenue by day
    const expensesByDayMap = new Map<string, number>()
    expenses?.forEach((expense) => {
      const current = expensesByDayMap.get(expense.date) || 0
      expensesByDayMap.set(expense.date, current + Number(expense.amount))
    })

    const revenueByDay = Array.from(revenueByDayMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        expenses: expensesByDayMap.get(date) || 0,
        profit: data.revenue - (expensesByDayMap.get(date) || 0),
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Expenses by category
    const expensesByCategoryMap = new Map<string, { amount: number; count: number }>()
    expenses?.forEach((expense) => {
      const current = expensesByCategoryMap.get(expense.category) || { amount: 0, count: 0 }
      expensesByCategoryMap.set(expense.category, {
        amount: current.amount + Number(expense.amount),
        count: current.count + 1,
      })
    })
    const expensesByCategory = Array.from(expensesByCategoryMap.entries()).map(
      ([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
      })
    )

    // Calculate net profit and profit margin
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Top-selling items
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("name, quantity, unit_price, order_id")
      .in(
        "order_id",
        filteredOrders.map((o) => o.id)
      )

    const itemsMap = new Map<string, { quantity: number; revenue: number }>()
    orderItems?.forEach((item) => {
      const current = itemsMap.get(item.name) || { quantity: 0, revenue: 0 }
      itemsMap.set(item.name, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + Number(item.unit_price) * item.quantity,
      })
    })
    const topSellingItems = Array.from(itemsMap.entries())
      .map(([name, data]) => ({ name, quantity: data.quantity, revenue: data.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Transaction history
    const transactions = filteredOrders.map((order) => ({
      id: order.id,
      order_number: order.order_number,
      created_at: order.created_at,
      customer_name: order.customer_name,
      payment_method: order.payments?.[0]?.method || "unknown",
      amount: Number(order.total),
      status: order.status,
      table_label: (order.tables as any)?.label || null,
    }))

    return {
      data: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        totalOrders,
        averageOrderValue,
        paymentMethodBreakdown,
        revenueByDay,
        topSellingItems,
        transactions,
        expensesByCategory,
      },
    }
  } catch (error) {
    console.error("Error fetching cashflow data:", error)
    return { error: "Failed to fetch cashflow data" }
  }
}

export async function exportCashflowToCSV(params: {
  startDate?: string
  endDate?: string
  paymentMethod?: string
}): Promise<{ data?: string; error?: string }> {
  const result = await getCashflowData(params)

  if (result.error || !result.data) {
    return { error: result.error || "No data to export" }
  }

  const { transactions } = result.data

  // Create CSV content
  const headers = ["Order #", "Date", "Customer", "Table", "Payment Method", "Amount", "Status"]
  const rows = transactions.map((t) => [
    t.order_number,
    new Date(t.created_at).toLocaleString("en-PH"),
    t.customer_name || "Walk-in",
    t.table_label || "Takeout",
    t.payment_method,
    t.amount.toFixed(2),
    t.status,
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n")

  return { data: csvContent }
}
