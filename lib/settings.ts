"use server"

import { createClient } from "@/lib/supabase/server"
import { TAX_RATE } from "@/lib/constants"

/**
 * Fetch the current tax rate from restaurant settings
 * Returns the tax rate as a decimal (e.g., 0.12 for 12%)
 * Falls back to default TAX_RATE constant if database fetch fails
 */
export async function getTaxRate(): Promise<number> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("restaurant_settings")
      .select("tax_rate")
      .eq("id", 1)
      .single()

    if (error || !data) {
      console.warn("Failed to fetch tax rate from settings, using fallback:", error?.message)
      return TAX_RATE
    }

    // Convert from percentage (e.g., 12) to decimal (e.g., 0.12)
    return Number(data.tax_rate) / 100
  } catch (err) {
    console.error("Error fetching tax rate:", err)
    return TAX_RATE
  }
}

/**
 * Fetch the current service charge rate from restaurant settings
 * Returns the service charge as a decimal (e.g., 0.10 for 10%)
 * Returns 0 if database fetch fails
 */
export async function getServiceCharge(): Promise<number> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("restaurant_settings")
      .select("service_charge")
      .eq("id", 1)
      .single()

    if (error || !data) {
      return 0
    }

    // Convert from percentage (e.g., 10) to decimal (e.g., 0.10)
    return Number(data.service_charge) / 100
  } catch {
    return 0
  }
}

/**
 * Fetch all restaurant settings
 */
export async function getRestaurantSettings() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("restaurant_settings")
      .select("*")
      .eq("id", 1)
      .single()

    if (error || !data) {
      return null
    }

    return data
  } catch {
    return null
  }
}
