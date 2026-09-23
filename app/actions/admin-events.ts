"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  EventBooking,
  EventPayment,
  EventVenue,
  EventPackage,
  EventInquiry,
  BookingStatus,
  PaymentVerificationStatus,
} from "@/lib/types/events"

// ============================================================
// BOOKING MANAGEMENT
// ============================================================

/**
 * Get all bookings with filters (admin view)
 */
export async function getAllBookings(filters?: {
  status?: string
  venue_id?: string
  date_from?: string
  date_to?: string
  search?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from("event_bookings")
    .select(`
      *,
      customer:event_customers(full_name, email, phone),
      venue:event_venues(name, location)
    `)

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.venue_id) {
    query = query.eq("venue_id", filters.venue_id)
  }

  if (filters?.date_from) {
    query = query.gte("event_date", filters.date_from)
  }

  if (filters?.date_to) {
    query = query.lte("event_date", filters.date_to)
  }

  if (filters?.search) {
    query = query.or(
      `booking_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) return { error: error.message }
  return { bookings: data as EventBooking[] }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
  notes?: string
) {
  const supabase = await createClient()

  // Get current user ID for confirmed_by/cancelled_by
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id

  const updateData: any = {
    status,
    notes,
  }

  // Set confirmation timestamp if confirming
  if (status === "confirmed") {
    updateData.confirmed_at = new Date().toISOString()
    if (userId) {
      updateData.confirmed_by = userId // Use UUID instead of "admin" string
    }
  }

  // Set cancellation timestamp if cancelling
  if (status === "cancelled") {
    updateData.cancelled_at = new Date().toISOString()
    if (userId) {
      updateData.cancelled_by = userId // Use UUID instead of "admin" string
    }
    updateData.cancellation_reason = notes
  }

  const { data: bookings, error } = await supabase
    .from("event_bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()

  if (error) return { error: error.message }
  
  if (!bookings || bookings.length === 0) {
    return { error: "Booking not found" }
  }

  const data = bookings[0]

  // Log activity (ignore errors if log_activity doesn't exist)
  try {
    await supabase.rpc("log_activity", {
      p_action: `event.booking.${status}`,
      p_entity: "event_booking",
      p_entity_id: bookingId,
      p_detail: { status, notes },
    })
  } catch {
    // Silently ignore if log_activity RPC doesn't exist
  }

  revalidatePath("/admin/events/bookings")
  revalidatePath(`/admin/events/bookings/${bookingId}`)
  revalidatePath("/events/dashboard/bookings")

  return { booking: data as EventBooking }
}

/**
 * Get booking statistics for dashboard
 */
export async function getBookingStats(dateRange?: { from: string; to: string }) {
  const supabase = await createClient()

  let query = supabase
    .from("event_bookings")
    .select("status, payment_status, total_amount, total_paid, event_date")

  if (dateRange) {
    query = query.gte("event_date", dateRange.from).lte("event_date", dateRange.to)
  }

  const { data, error } = await query

  if (error) return { error: error.message }

  // Calculate stats
  const stats = {
    total_bookings: data.length,
    pending_bookings: data.filter(b => b.status === "pending").length,
    confirmed_bookings: data.filter(b => b.status === "confirmed").length,
    paid_bookings: data.filter(b => b.status === "paid").length,
    completed_bookings: data.filter(b => b.status === "completed").length,
    cancelled_bookings: data.filter(b => b.status === "cancelled").length,
    total_revenue: data
      .filter(b => b.payment_status === "paid")
      .reduce((sum, b) => sum + Number(b.total_amount), 0),
    pending_revenue: data
      .filter(b => b.status !== "cancelled")
      .reduce((sum, b) => sum + (Number(b.total_amount) - Number(b.total_paid)), 0),
  }

  return { stats }
}

// ============================================================
// PAYMENT VERIFICATION
// ============================================================

/**
 * Get all pending payment verifications
 */
export async function getPendingPayments() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("event_payments")
    .select(`
      *,
      booking:event_bookings(
        booking_number,
        customer_name,
        event_date,
        event_type,
        venue_name,
        total_amount,
        total_paid
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) return { error: error.message }
  return { payments: data as EventPayment[] }
}

/**
 * Get all payments (with filters)
 */
export async function getAllPayments(filters?: {
  status?: string
  date_from?: string
  date_to?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from("event_payments")
    .select(`
      *,
      booking:event_bookings(
        booking_number,
        customer_name,
        event_date,
        venue_name
      )
    `)

  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.date_from) {
    query = query.gte("created_at", filters.date_from)
  }

  if (filters?.date_to) {
    query = query.lte("created_at", filters.date_to)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) return { error: error.message }
  return { payments: data as EventPayment[] }
}

/**
 * Verify or reject payment proof
 */
export async function verifyPayment(
  paymentId: string,
  verified: boolean,
  notes?: string
) {
  const supabase = await createClient()

  const status: PaymentVerificationStatus = verified ? "verified" : "rejected"

  // 1. Update payment status
  const { data: payments, error: paymentError } = await supabase
    .from("event_payments")
    .update({
      status,
      verified_at: new Date().toISOString(),
      verified_by: "admin",
      rejection_reason: !verified ? notes : null,
      notes: verified ? notes : undefined,
    })
    .eq("id", paymentId)
    .select()

  if (paymentError) return { error: paymentError.message }
  
  if (!payments || payments.length === 0) {
    return { error: "Payment not found" }
  }

  const payment = payments[0]

  // 2. If verified, update booking total_paid and payment_status
  if (verified) {
    const { data: booking } = await supabase
      .from("event_bookings")
      .select("total_paid, total_amount, deposit_required")
      .eq("id", payment.booking_id)
      .single()

    if (booking) {
      const newTotalPaid = Number(booking.total_paid) + Number(payment.amount)
      const totalAmount = Number(booking.total_amount)

      let newPaymentStatus: "pending" | "partial" | "paid" = "partial"
      let newBookingStatus = undefined

      if (newTotalPaid >= totalAmount) {
        newPaymentStatus = "paid"
        newBookingStatus = "paid" // Automatically move to paid status
      } else if (newTotalPaid > 0) {
        newPaymentStatus = "partial"
      }

      await supabase
        .from("event_bookings")
        .update({
          total_paid: newTotalPaid,
          payment_status: newPaymentStatus,
          ...(newBookingStatus ? { status: newBookingStatus } : {}),
        })
        .eq("id", payment.booking_id)
    }
  }

  revalidatePath("/admin/events/payments")
  revalidatePath("/admin/events/bookings")
  revalidatePath("/events/dashboard/bookings")

  return { payment }
}

// ============================================================
// VENUE MANAGEMENT
// ============================================================

/**
 * Get all venues (including inactive)
 */
export async function getAllVenues() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("event_venues")
    .select("*")
    .order("sort_order")

  if (error) return { error: error.message }
  return { venues: data as EventVenue[] }
}

/**
 * Get single venue by ID
 */
export async function getVenueById(venueId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("event_venues")
    .select("*")
    .eq("id", venueId)

  if (error) return { error: error.message }
  
  if (!data || data.length === 0) {
    return { error: "Venue not found" }
  }

  return { venue: data[0] as EventVenue }
}

/**
 * Create new venue
 */
export async function createVenue(data: {
  name: string
  description?: string
  location: string
  capacity_min: number
  capacity_max: number
  area_sqm?: number
  base_rate: number
  hourly_rate?: number
  amenities: string[]
  photos: string[]
  floor_plan_url?: string
  is_active?: boolean
}) {
  const supabase = await createClient()

  // Get max sort_order
  const { data: venues } = await supabase
    .from("event_venues")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)

  const sort_order = venues && venues.length > 0 ? venues[0].sort_order + 1 : 1

  const { data: newVenues, error } = await supabase
    .from("event_venues")
    .insert({
      ...data,
      sort_order,
      is_active: data.is_active ?? true,
    })
    .select()

  if (error) return { error: error.message }
  
  if (!newVenues || newVenues.length === 0) {
    return { error: "Failed to create venue" }
  }

  const venue = newVenues[0]

  revalidatePath("/admin/events/venues")
  revalidatePath("/events/venues")

  return { venue: venue as EventVenue }
}

/**
 * Update venue
 */
export async function updateVenue(
  venueId: string,
  data: Partial<EventVenue>
) {
  const supabase = await createClient()

  const { data: venues, error } = await supabase
    .from("event_venues")
    .update(data)
    .eq("id", venueId)
    .select()

  if (error) return { error: error.message }
  
  if (!venues || venues.length === 0) {
    return { error: "Venue not found" }
  }

  const venue = venues[0]

  revalidatePath("/admin/events/venues")
  revalidatePath("/events/venues")
  revalidatePath(`/events/venues/${venueId}`)

  return { venue: venue as EventVenue }
}

/**
 * Delete venue
 */
export async function deleteVenue(venueId: string) {
  const supabase = await createClient()

  // Check if venue has bookings
  const { data: bookings } = await supabase
    .from("event_bookings")
    .select("id")
    .eq("venue_id", venueId)
    .limit(1)

  if (bookings && bookings.length > 0) {
    return { 
      error: "Cannot delete venue with existing bookings. Set as inactive instead." 
    }
  }

  const { error } = await supabase
    .from("event_venues")
    .delete()
    .eq("id", venueId)

  if (error) return { error: error.message }

  revalidatePath("/admin/events/venues")
  revalidatePath("/events/venues")

  return { success: true }
}

// ============================================================
// PACKAGE MANAGEMENT
// ============================================================

/**
 * Get all packages (including inactive)
 */
export async function getAllPackages() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("event_packages")
    .select("*")
    .order("sort_order")

  if (error) return { error: error.message }
  return { packages: data as EventPackage[] }
}

/**
 * Create new package
 */
export async function createPackage(data: Omit<EventPackage, "id" | "created_at" | "updated_at" | "sort_order">) {
  const supabase = await createClient()

  // Get max sort_order
  const { data: packages } = await supabase
    .from("event_packages")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)

  const sort_order = packages && packages.length > 0 ? packages[0].sort_order + 1 : 1

  const { data: newPackages, error } = await supabase
    .from("event_packages")
    .insert({
      ...data,
      sort_order,
    })
    .select()

  if (error) return { error: error.message }
  
  if (!newPackages || newPackages.length === 0) {
    return { error: "Failed to create package" }
  }

  const pkg = newPackages[0]

  revalidatePath("/admin/events/packages")
  revalidatePath("/events/packages")

  return { package: pkg as EventPackage }
}

/**
 * Update package
 */
export async function updatePackage(
  packageId: string,
  data: Partial<EventPackage>
) {
  const supabase = await createClient()

  const { data: packages, error } = await supabase
    .from("event_packages")
    .update(data)
    .eq("id", packageId)
    .select()

  if (error) return { error: error.message }
  
  if (!packages || packages.length === 0) {
    return { error: "Package not found" }
  }

  const pkg = packages[0]

  revalidatePath("/admin/events/packages")
  revalidatePath("/events/packages")

  return { package: pkg as EventPackage }
}

/**
 * Delete package
 */
export async function deletePackage(packageId: string) {
  const supabase = await createClient()

  // Check if package has bookings
  const { data: bookings } = await supabase
    .from("event_bookings")
    .select("id")
    .eq("package_id", packageId)
    .limit(1)

  if (bookings && bookings.length > 0) {
    return { 
      error: "Cannot delete package with existing bookings. Set as inactive instead." 
    }
  }

  const { error } = await supabase
    .from("event_packages")
    .delete()
    .eq("id", packageId)

  if (error) return { error: error.message }

  revalidatePath("/admin/events/packages")
  revalidatePath("/events/packages")

  return { success: true }
}

// ============================================================
// INQUIRY MANAGEMENT
// ============================================================

/**
 * Get all inquiries
 */
export async function getAllInquiries(status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("event_inquiries")
    .select("*")
    .order("created_at", { ascending: false })

  if (status) {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) return { error: error.message }
  return { inquiries: data as EventInquiry[] }
}

/**
 * Update inquiry status
 */
export async function updateInquiryStatus(
  inquiryId: string,
  status: "new" | "responded" | "converted" | "closed",
  response_notes?: string
) {
  const supabase = await createClient()

  const { data: inquiries, error } = await supabase
    .from("event_inquiries")
    .update({
      status,
      response_notes,
      responded_at: status === "responded" ? new Date().toISOString() : undefined,
      responded_by: status === "responded" ? "admin" : undefined,
    })
    .eq("id", inquiryId)
    .select()

  if (error) return { error: error.message }
  
  if (!inquiries || inquiries.length === 0) {
    return { error: "Inquiry not found" }
  }

  const data = inquiries[0]

  revalidatePath("/admin/events/inquiries")

  return { inquiry: data as EventInquiry }
}
