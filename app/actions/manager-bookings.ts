'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type BookingFilters = {
  status?: string
  venueId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

// Get all bookings with filters
export async function getBookings(filters?: BookingFilters) {
  const supabase = await createClient()

  let query = supabase
    .from("event_bookings")
    .select(`
      *,
      event_packages (
        id,
        name,
        base_price
      ),
      event_venues (
        id,
        name
      ),
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

  if (filters?.venueId) {
    query = query.eq("venue_id", filters.venueId)
  }

  if (filters?.dateFrom) {
    query = query.gte("event_date", filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte("event_date", filters.dateTo)
  }

  if (filters?.search) {
    query = query.or(`customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching bookings:", error)
    return { bookings: [], error: error.message }
  }

  return { bookings: data || [], error: null }
}

// Get single booking by ID
export async function getBookingById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("event_bookings")
    .select(`
      *,
      event_packages (
        id,
        name,
        description,
        base_price,
        inclusions
      ),
      event_venues (
        id,
        name,
        capacity,
        location
      ),
      event_customers (
        id,
        full_name,
        email,
        phone
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching booking:", error)
    return { booking: null, error: error.message }
  }

  return { booking: data, error: null }
}

// Update booking status
export async function updateBookingStatus(id: string, status: string) {
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
    .from("event_bookings")
    .update(updateData)
    .eq("id", id)

  if (error) {
    console.error("Error updating booking status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/bookings")
  return { success: true, error: null }
}

// Approve booking
export async function approveBooking(id: string) {
  return updateBookingStatus(id, 'confirmed')
}

// Reject booking with reason
export async function rejectBooking(id: string, reason: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("event_bookings")
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    console.error("Error rejecting booking:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/bookings")
  return { success: true, error: null }
}

// Update payment status
export async function updateBookingPaymentStatus(id: string, paymentStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("event_bookings")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating payment status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/bookings")
  return { success: true, error: null }
}

// Get booking statistics
export async function getBookingStats(dateFrom?: string, dateTo?: string) {
  const supabase = await createClient()

  let query = supabase
    .from("event_bookings")
    .select("status, total_amount, event_date, created_at")

  if (dateFrom) {
    query = query.gte("event_date", dateFrom)
  }

  if (dateTo) {
    query = query.lte("event_date", dateTo)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching booking stats:", error)
    return {
      totalBookings: 0,
      totalRevenue: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      error: error.message
    }
  }

  const stats = {
    totalBookings: data?.length || 0,
    totalRevenue: data?.reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0,
    pendingBookings: data?.filter(b => b.status === 'pending').length || 0,
    confirmedBookings: data?.filter(b => b.status === 'confirmed').length || 0,
    error: null
  }

  return stats
}

// Get available venues for filter
export async function getVenues() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("event_venues")
    .select("id, name")
    .eq("is_active", true)
    .order("name")

  if (error) {
    console.error("Error fetching venues:", error)
    return { venues: [], error: error.message }
  }

  return { venues: data || [], error: null }
}
