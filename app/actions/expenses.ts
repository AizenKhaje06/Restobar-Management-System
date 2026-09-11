"use server"

import { createClient } from "@/lib/supabase/server"
import { getSessionProfile } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type ExpenseCategory = 
  | "ingredients" 
  | "utilities" 
  | "salaries" 
  | "rent" 
  | "equipment" 
  | "marketing" 
  | "maintenance" 
  | "other"

export interface Expense {
  id: string
  created_at: string
  date: string
  category: ExpenseCategory
  description: string
  amount: number
  notes: string | null
  receipt_url: string | null
  created_by: string | null
}

export async function getExpenses(params: {
  startDate?: string
  endDate?: string
  category?: ExpenseCategory | "all"
}): Promise<{ data?: Expense[]; error?: string }> {
  const supabase = await createClient()
  const profile = await getSessionProfile()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    let query = supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false })

    if (params.startDate) {
      query = query.gte("date", params.startDate)
    }
    if (params.endDate) {
      query = query.lte("date", params.endDate)
    }
    if (params.category && params.category !== "all") {
      query = query.eq("category", params.category)
    }

    const { data, error } = await query

    if (error) {
      return { error: error.message }
    }

    return { data: data as Expense[] }
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return { error: "Failed to fetch expenses" }
  }
}

export async function createExpense(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const profile = await getSessionProfile()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const date = formData.get("date") as string
  const category = formData.get("category") as ExpenseCategory
  const description = formData.get("description") as string
  const amount = parseFloat(formData.get("amount") as string)
  const notes = (formData.get("notes") as string) || null

  if (!date || !category || !description || isNaN(amount)) {
    return { error: "Missing required fields" }
  }

  try {
    const { error } = await supabase.from("expenses").insert({
      date,
      category,
      description,
      amount,
      notes,
      created_by: profile.id,
    })

    if (error) {
      return { error: error.message }
    }

    await supabase.rpc("log_activity", {
      p_action: "expense.created",
      p_entity: "expense",
      p_detail: { description, amount, category },
    })

    revalidatePath("/admin/cashflow")
    return { success: true }
  } catch (error) {
    console.error("Error creating expense:", error)
    return { error: "Failed to create expense" }
  }
}

export async function updateExpense(
  id: string,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const profile = await getSessionProfile()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized" }
  }

  const date = formData.get("date") as string
  const category = formData.get("category") as ExpenseCategory
  const description = formData.get("description") as string
  const amount = parseFloat(formData.get("amount") as string)
  const notes = (formData.get("notes") as string) || null

  if (!date || !category || !description || isNaN(amount)) {
    return { error: "Missing required fields" }
  }

  try {
    const { error } = await supabase
      .from("expenses")
      .update({
        date,
        category,
        description,
        amount,
        notes,
      })
      .eq("id", id)

    if (error) {
      return { error: error.message }
    }

    await supabase.rpc("log_activity", {
      p_action: "expense.updated",
      p_entity: "expense",
      p_entity_id: id,
    })

    revalidatePath("/admin/cashflow")
    return { success: true }
  } catch (error) {
    console.error("Error updating expense:", error)
    return { error: "Failed to update expense" }
  }
}

export async function deleteExpense(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const profile = await getSessionProfile()

  if (!profile || profile.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    const { error } = await supabase.from("expenses").delete().eq("id", id)

    if (error) {
      return { error: error.message }
    }

    await supabase.rpc("log_activity", {
      p_action: "expense.deleted",
      p_entity: "expense",
      p_entity_id: id,
    })

    revalidatePath("/admin/cashflow")
    return { success: true }
  } catch (error) {
    console.error("Error deleting expense:", error)
    return { error: "Failed to delete expense" }
  }
}
