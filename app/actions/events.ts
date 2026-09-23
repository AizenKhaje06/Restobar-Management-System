"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  EventCustomer,
  EventVenue,
  EventPackage,
  EventMenuPackage,
  EventAddon,
  EventBooking,
  EventPayment,
  EventInquiry,
  VenueAvailability,
  PricingCalculation,
} from "@/lib/types/events"

// ============================================================
// CUSTOMER AUTHENTICATION & PROFILE
// ============================================================

/**
 * Get event customer profile by auth ID
 */
export async function getEventCustomerByAuth() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase
    .from("event_customers")
    .select("*")
    .eq("auth_id", user.id)
    .single()

  if (error) return { error: error.message }
  return { customer: data as EventCustomer }
}

/**
 * Create new event customer account
 */
export async function createEventCustomer(input: {
  email: string
  password: string
  full_name: string
  phone: string
  address?: string
}) {
  const supabase = await createClient()

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  })

  if (authError) return { error: authError.message }
  if (!authData.user) return { error: "Failed to create account" }

  // 2. Create customer profile
  const { data: customer, error: profileError } = await supabase
    .from("event_customers")
    .insert({
      auth_id: authData.user.id,
      email: input.email,
      full_name: input.full_name,
      phone: input.phone,
      address: input.address,
    })
    .select()
    .single()

  if (profileError) {
    // Rollback auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { error: profileError.message }
  }

  return { customer: customer as EventCustomer }
}

/**
 * Update customer profile
 */
export async function updateEventCustomer(input: {
  full_name?: string
  phone?: string
  address?: string
  date_of_birth?: string
  company_name?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase
    .from("event_customers")
    .update(input)
    .eq("auth_id", user.id)
    .select()
    .single()

  if (error) return { error: error.message }
  
  revalidatePath("/events/profile")
  return { customer: data as EventCustomer }
}

// ============================================================
// VENUES
// ============================================================

/**
 * Get all active venues
 */
export async function getVenues() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("event_venues")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")

  if (error) return { error: error.message }
  return { venues: data as EventVenue[] }
}

/**
 * Get single venue by ID
 */
export async function getVenue(venueId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("event_venues")
    .select("*")
    .eq("id", venueId)
    .single()

  if (error) return { error: error.message }
  return { venue: data as EventVenue }
}

/**
 * Check venue availability for a specific date
 */
export async function checkVenueAvailability(
  venueId: string,
  date: string
): Promise<{ available: boolean; reason?: string; booking?: any }> {
  const supabase = await createClient()

  // Check if date is blocked
  const { data: blockedDate } = await supabase
    .from("venue_blocked_dates")
    .select("reason")
    .eq("venue_id", venueId)
    .eq("blocked_date", date)
    .maybeSingle()

  if (blockedDate) {
    return {
      available: false,
      reason: blockedDate.reason || "Date is blocked",
    }
  }

  // Check if venue has existing booking on this date
  const { data: existingBooking } = await supabase
    .from("event_bookings")
    .select("booking_number, event_type, event_start_time, event_end_time")
    .eq("venue_id", venueId)
    .eq("event_date", date)
    .in("status", ["pending", "confirmed", "paid"])
    .maybeSingle()

  if (existingBooking) {
    return {
      available: false,
      reason: "Venue already booked",
      booking: existingBooking,
    }
  }

  return { available: true }
}

// ============================================================
// PACKAGES
// ============================================================

/**
 * Get all active event packages
 */
export async function getEventPackages(filters?: {
  event_type?: string
  featured_only?: boolean
}) {
  const supabase = await createClient()

  let query = supabase
    .from("event_packages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")

  if (filters?.event_type) {
    query = query.eq("event_type", filters.event_type)
  }

  if (filters?.featured_only) {
    query = query.eq("is_featured", true)
  }

  const { data, error } = await query

  if (error) return { error: error.message }
  return { packages: data as EventPackage[] }
}

/**
 * Get single package by slug or ID
 */
export async function getEventPackage(slugOrId: string) {
  const supabase = await createClient()

  // Try by slug first
  let { data, error } = await supabase
    .from("event_packages")
    .select("*")
    .eq("slug", slugOrId)

  // If not found by slug, try by ID
  if (!data || data.length === 0) {
    const result = await supabase
      .from("event_packages")
      .select("*")
      .eq("id", slugOrId)
    data = result.data
    error = result.error
  }

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: "Package not found" }
  
  return { package: data[0] as EventPackage }
}

// ============================================================
// MENU PACKAGES
// ============================================================

/**
 * Get all menu packages
 */
export async function getMenuPackages(category?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("event_menu_packages")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error) return { error: error.message }
  return { menuPackages: data as EventMenuPackage[] }
}

// ============================================================
// ADD-ONS
// ============================================================

/**
 * Get all active add-ons
 */
export async function getEventAddons(category?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("event_addons")
    .select("*")
    .eq("is_active", true)

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error) return { error: error.message }
  return { addons: data as EventAddon[] }
}

// ============================================================
// PRICING CALCULATION
// ============================================================

/**
 * Calculate booking total price
 */
export async function calculateBookingPrice(input: {
  venue_id: string
  package_id?: string
  menu_package_id?: string
  num_guests: number
  addon_ids?: string[]
  addon_quantities?: Record<string, number>
  duration_hours?: number
}): Promise<{ pricing?: PricingCalculation; error?: string }> {
  const supabase = await createClient()

  let venue_cost = 0
  let food_cost = 0
  let addons_cost = 0

  // 1. Venue cost
  const { data: venue } = await supabase
    .from("event_venues")
    .select("base_rate, hourly_rate")
    .eq("id", input.venue_id)
    .single()

  if (venue) {
    venue_cost = Number(venue.base_rate)
    if (input.duration_hours && venue.hourly_rate) {
      const extraHours = Math.max(0, input.duration_hours - 4) // Base includes 4 hours
      venue_cost += extraHours * Number(venue.hourly_rate)
    }
  }

  // 2. Package cost (if selected)
  if (input.package_id) {
    const { data: pkg } = await supabase
      .from("event_packages")
      .select("price_per_person, base_price")
      .eq("id", input.package_id)
      .single()

    if (pkg) {
      if (pkg.price_per_person) {
        venue_cost += Number(pkg.price_per_person) * input.num_guests
      } else if (pkg.base_price) {
        venue_cost += Number(pkg.base_price)
      }
    }
  }

  // 3. Food cost
  if (input.menu_package_id) {
    const { data: menu } = await supabase
      .from("event_menu_packages")
      .select("price_per_person")
      .eq("id", input.menu_package_id)
      .single()

    if (menu) {
      food_cost = Number(menu.price_per_person) * input.num_guests
    }
  }

  // 4. Add-ons cost
  if (input.addon_ids && input.addon_ids.length > 0) {
    const { data: addons } = await supabase
      .from("event_addons")
      .select("id, price")
      .in("id", input.addon_ids)

    if (addons) {
      addons.forEach((addon) => {
        const quantity = input.addon_quantities?.[addon.id] || 1
        addons_cost += Number(addon.price) * quantity
      })
    }
  }

  // 5. Calculate totals
  const subtotal = venue_cost + food_cost + addons_cost
  const service_charge = subtotal * 0.1 // 10% service charge
  const tax = 0 // Adjust based on your tax requirements
  const total = subtotal + service_charge + tax

  const deposit_required = total * 0.5 // 50% deposit
  const balance_due = total - deposit_required

  return {
    pricing: {
      venue_cost,
      food_cost,
      addons_cost,
      subtotal,
      service_charge,
      tax,
      total,
      deposit_required,
      balance_due,
    },
  }
}

// ============================================================
// BOOKINGS
// ============================================================

/**
 * Generate unique booking number
 */
async function generateBookingNumber(): Promise<string> {
  const supabase = await createClient()
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")

  // Get today's booking count
  const { count } = await supabase
    .from("event_bookings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(date.setHours(0, 0, 0, 0)).toISOString())

  const sequence = String((count || 0) + 1).padStart(3, "0")
  return `EVT-${dateStr}-${sequence}`
}

/**
 * Create new event booking
 */
export async function createEventBooking(input: {
  // Event details
  event_type: string
  event_name?: string
  event_date: string
  event_start_time: string
  event_end_time: string
  num_guests: number
  
  // Selections
  venue_id: string
  package_id?: string
  menu_package_id?: string
  addon_ids?: string[]
  addon_quantities?: Record<string, number>
  
  // Customization
  decorations_theme?: string
  decorations_notes?: string
  seating_arrangement?: string
  special_requests?: string
  dietary_restrictions?: string
  
  // Customer (if not logged in, they provide details)
  customer_name?: string
  customer_email?: string
  customer_phone?: string
}) {
  const supabase = await createClient()

  // 1. Get customer ID (if logged in)
  const { data: { user } } = await supabase.auth.getUser()
  let customer_id: string | null = null
  let customer_name = input.customer_name || ""
  let customer_email = input.customer_email || ""
  let customer_phone = input.customer_phone || ""

  if (user) {
    const { data: customer } = await supabase
      .from("event_customers")
      .select("id, full_name, email, phone")
      .eq("auth_id", user.id)
      .single()

    if (customer) {
      customer_id = customer.id
      customer_name = customer.full_name
      customer_email = customer.email
      customer_phone = customer.phone
    }
  }

  // 2. Check venue availability
  const availability = await checkVenueAvailability(input.venue_id, input.event_date)
  if (!availability.available) {
    return { error: availability.reason || "Venue not available" }
  }

  // 3. Get venue name
  const { data: venue } = await supabase
    .from("event_venues")
    .select("name")
    .eq("id", input.venue_id)
    .single()

  // 4. Get package name (if selected)
  let package_name: string | null = null
  if (input.package_id) {
    const { data: pkg } = await supabase
      .from("event_packages")
      .select("name")
      .eq("id", input.package_id)
      .single()
    package_name = pkg?.name || null
  }

  // 5. Get menu package name (if selected)
  let menu_package_name: string | null = null
  if (input.menu_package_id) {
    const { data: menu } = await supabase
      .from("event_menu_packages")
      .select("name")
      .eq("id", input.menu_package_id)
      .single()
    menu_package_name = menu?.name || null
  }

  // 6. Calculate pricing
  const start = new Date(`2000-01-01T${input.event_start_time}`)
  const end = new Date(`2000-01-01T${input.event_end_time}`)
  const duration_hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

  const { pricing, error: pricingError } = await calculateBookingPrice({
    venue_id: input.venue_id,
    package_id: input.package_id,
    menu_package_id: input.menu_package_id,
    num_guests: input.num_guests,
    addon_ids: input.addon_ids,
    addon_quantities: input.addon_quantities,
    duration_hours,
  })

  if (pricingError || !pricing) {
    return { error: pricingError || "Failed to calculate pricing" }
  }

  // 7. Generate booking number
  const booking_number = await generateBookingNumber()

  // 8. Calculate payment due date (7 days from now)
  const payment_due_date = new Date()
  payment_due_date.setDate(payment_due_date.getDate() + 7)

  // 9. Create booking
  const { data: booking, error: bookingError } = await supabase
    .from("event_bookings")
    .insert({
      booking_number,
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      event_type: input.event_type,
      event_name: input.event_name,
      event_date: input.event_date,
      event_start_time: input.event_start_time,
      event_end_time: input.event_end_time,
      duration_hours,
      venue_id: input.venue_id,
      venue_name: venue?.name,
      num_guests: input.num_guests,
      package_id: input.package_id,
      package_name,
      menu_package_id: input.menu_package_id,
      menu_package_name,
      decorations_theme: input.decorations_theme,
      decorations_notes: input.decorations_notes,
      seating_arrangement: input.seating_arrangement,
      special_requests: input.special_requests,
      dietary_restrictions: input.dietary_restrictions,
      venue_cost: pricing.venue_cost,
      food_cost: pricing.food_cost,
      addons_cost: pricing.addons_cost,
      subtotal: pricing.subtotal,
      service_charge: pricing.service_charge,
      tax: pricing.tax,
      total_amount: pricing.total,
      deposit_required: pricing.deposit_required,
      balance_due: pricing.balance_due,
      payment_due_date: payment_due_date.toISOString().split("T")[0],
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single()

  if (bookingError) return { error: bookingError.message }

  // 10. Insert add-ons (if any)
  if (input.addon_ids && input.addon_ids.length > 0) {
    const { data: addons } = await supabase
      .from("event_addons")
      .select("id, name, price")
      .in("id", input.addon_ids)

    if (addons) {
      const addonInserts = addons.map((addon) => {
        const quantity = input.addon_quantities?.[addon.id] || 1
        return {
          booking_id: booking.id,
          addon_id: addon.id,
          addon_name: addon.name,
          quantity,
          unit_price: Number(addon.price),
          total_price: Number(addon.price) * quantity,
        }
      })

      await supabase.from("event_booking_addons").insert(addonInserts)
    }
  }

  // 11. Log activity
  await supabase.rpc("log_activity", {
    p_action: "event.booking.created",
    p_entity: "event_booking",
    p_entity_id: booking.id,
    p_detail: {
      booking_number,
      event_type: input.event_type,
      event_date: input.event_date,
      venue_name: venue?.name,
      num_guests: input.num_guests,
      total_amount: pricing.total,
    },
  })

  revalidatePath("/events/dashboard")
  revalidatePath("/admin/events/bookings")

  return { booking: booking as EventBooking }
}

/**
 * Get customer's bookings
 */
export async function getCustomerBookings() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: customer } = await supabase
    .from("event_customers")
    .select("id")
    .eq("auth_id", user.id)
    .single()

  if (!customer) return { error: "Customer profile not found" }

  const { data, error } = await supabase
    .from("event_bookings")
    .select(`
      *,
      venue:event_venues(name, location),
      package:event_packages(name),
      addons:event_booking_addons(*, addon:event_addons(name))
    `)
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })

  if (error) return { error: error.message }
  return { bookings: data as EventBooking[] }
}

/**
 * Get single booking details
 */
export async function getBooking(bookingId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("event_bookings")
    .select(`
      *,
      venue:event_venues(*),
      package:event_packages(*),
      menu_package:event_menu_packages(*),
      addons:event_booking_addons(*, addon:event_addons(*)),
      payments:event_payments(*)
    `)
    .eq("id", bookingId)
    .single()

  if (error) return { error: error.message }
  return { booking: data as EventBooking }
}

// ============================================================
// INQUIRIES
// ============================================================

/**
 * Submit contact inquiry
 */
export async function submitInquiry(input: {
  name: string
  email: string
  phone: string
  event_type?: string
  event_date?: string
  num_guests?: number
  message: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("event_inquiries")
    .insert(input)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath("/admin/events/inquiries")
  return { inquiry: data as EventInquiry }
}

// ============================================================
// PAYMENT PROOF UPLOAD
// ============================================================

/**
 * Upload payment proof
 */
export async function uploadPaymentProof(input: {
  booking_id: string
  amount: number
  payment_method: string
  reference_number?: string
  proof_file: File
}) {
  const supabase = await createClient()

  // 1. Upload file to Supabase Storage
  const fileExt = input.proof_file.name.split(".").pop()
  const fileName = `${input.booking_id}-${Date.now()}.${fileExt}`
  const filePath = `payment-proofs/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from("event-documents")
    .upload(filePath, input.proof_file)

  if (uploadError) return { error: uploadError.message }

  // 2. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("event-documents")
    .getPublicUrl(filePath)

  // 3. Determine payment type
  const { data: booking } = await supabase
    .from("event_bookings")
    .select("deposit_required, total_paid, total_amount")
    .eq("id", input.booking_id)
    .single()

  let payment_type: "deposit" | "partial" | "full" = "partial"
  if (booking) {
    const newTotal = Number(booking.total_paid) + input.amount
    if (newTotal >= Number(booking.total_amount)) {
      payment_type = "full"
    } else if (Number(booking.total_paid) === 0) {
      payment_type = "deposit"
    }
  }

  // 4. Generate payment number
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "")
  const { count } = await supabase
    .from("event_payments")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(date.setHours(0, 0, 0, 0)).toISOString())
  const sequence = String((count || 0) + 1).padStart(3, "0")
  const payment_number = `PAY-${dateStr}-${sequence}`

  // 5. Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from("event_payments")
    .insert({
      payment_number,
      booking_id: input.booking_id,
      amount: input.amount,
      payment_type,
      payment_method: input.payment_method,
      reference_number: input.reference_number,
      proof_url: publicUrl,
      status: "pending",
    })
    .select()
    .single()

  if (paymentError) return { error: paymentError.message }

  revalidatePath(`/events/dashboard/bookings/${input.booking_id}`)
  revalidatePath("/admin/events/payments")

  return { payment: payment as EventPayment }
}
