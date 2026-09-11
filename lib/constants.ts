export const TAX_RATE = 0.12 // 12% VAT - DEPRECATED: Use getRestaurantTaxRate() instead
export const SERVICE_CHARGE = 0 // No service charge by default - DEPRECATED: Use getRestaurantServiceCharge() instead
export const CURRENCY = "₱"
export const RESTAURANT_NAME = "Lydias Lechon"
export const RESTAURANT_TAGLINE = "Great Food. Great Moments."

/**
 * Get the current tax rate from restaurant settings.
 * Falls back to TAX_RATE constant if settings not available.
 */
export async function getRestaurantTaxRate(): Promise<number> {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data } = await supabase
      .from("restaurant_settings")
      .select("tax_rate")
      .eq("id", 1)
      .maybeSingle()
    return data?.tax_rate ?? TAX_RATE
  } catch {
    return TAX_RATE
  }
}

/**
 * Get the current service charge from restaurant settings.
 * Falls back to SERVICE_CHARGE constant if settings not available.
 */
export async function getRestaurantServiceCharge(): Promise<number> {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data } = await supabase
      .from("restaurant_settings")
      .select("service_charge")
      .eq("id", 1)
      .maybeSingle()
    return data?.service_charge ?? SERVICE_CHARGE
  } catch {
    return SERVICE_CHARGE
  }
}

export function formatCurrency(amount: number): string {
  return `${CURRENCY}${Number(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  return d.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export function formatTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  return d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", hour12: true })
}

export function relativeTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  pos: "Cashier / POS",
  waiter: "Waiter",
}

export const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  pos: "/pos",
  waiter: "/waiter",
}

export function computeTotals(subtotal: number) {
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100
  return { subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100 }
}
