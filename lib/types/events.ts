// ============================================================
// EVENT BOOKING SYSTEM - TYPESCRIPT TYPES
// ============================================================

export interface EventCustomer {
  id: string
  auth_id: string
  email: string
  full_name: string
  phone: string
  address?: string
  date_of_birth?: string
  company_name?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface EventVenue {
  id: string
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
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface EventPackage {
  id: string
  name: string
  slug: string
  event_type: EventType
  description?: string
  short_description?: string
  price_per_person?: number
  base_price?: number
  min_guests: number
  max_guests: number
  duration_hours: number
  inclusions: PackageInclusion[]
  available_addons?: string[]
  featured_image?: string
  gallery: string[]
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PackageInclusion {
  item: string
  description?: string
  duration?: string
  quantity?: string | number
}

export interface EventMenuPackage {
  id: string
  name: string
  category: MenuCategory
  description?: string
  price_per_person: number
  min_order: number
  items: MenuItem[]
  dietary_info: DietaryInfo
  photo?: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface MenuItem {
  name: string
  description?: string
  is_signature?: boolean
}

export interface DietaryInfo {
  vegetarian?: boolean
  vegan?: boolean
  halal?: boolean
  gluten_free?: boolean
  dairy_free?: boolean
}

export interface EventAddon {
  id: string
  name: string
  category: AddonCategory
  description?: string
  price: number
  unit: string
  photo?: string
  is_active: boolean
  created_at: string
}

export interface EventBooking {
  id: string
  booking_number: string
  
  // Customer
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  
  // Event details
  event_type: EventType
  event_name?: string
  event_date: string
  event_start_time: string
  event_end_time: string
  duration_hours: number
  
  // Venue & capacity
  venue_id: string
  venue_name: string
  num_guests: number
  
  // Package selection
  package_id?: string
  package_name?: string
  menu_package_id?: string
  menu_package_name?: string
  
  // Customization
  decorations_theme?: string
  decorations_notes?: string
  seating_arrangement?: string
  special_requests?: string
  dietary_restrictions?: string
  
  // Pricing
  venue_cost: number
  food_cost: number
  addons_cost: number
  subtotal: number
  service_charge: number
  tax: number
  total_amount: number
  
  // Payment
  deposit_required: number
  deposit_paid: number
  balance_due: number
  total_paid: number
  payment_status: PaymentStatus
  payment_due_date?: string
  
  // Status
  status: BookingStatus
  
  // Contract
  contract_url?: string
  contract_signed: boolean
  contract_signed_at?: string
  
  // Administrative
  cancellation_reason?: string
  cancelled_at?: string
  cancelled_by?: string
  confirmed_by?: string
  confirmed_at?: string
  notes?: string
  
  created_at: string
  updated_at: string
  
  // Relations
  customer?: EventCustomer
  venue?: EventVenue
  package?: EventPackage
  menu_package?: EventMenuPackage
  addons?: EventBookingAddon[]
  payments?: EventPayment[]
}

export interface EventBookingAddon {
  id: string
  booking_id: string
  addon_id: string
  addon_name: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
  created_at: string
}

export interface EventPayment {
  id: string
  payment_number: string
  booking_id: string
  amount: number
  payment_type: PaymentType
  payment_method: PaymentMethod
  reference_number?: string
  proof_url?: string
  status: PaymentVerificationStatus
  verified_by?: string
  verified_at?: string
  rejection_reason?: string
  notes?: string
  created_at: string
}

export interface VenueBlockedDate {
  id: string
  venue_id: string
  blocked_date: string
  reason?: string
  blocked_by?: string
  created_at: string
}

export interface EventInquiry {
  id: string
  name: string
  email: string
  phone: string
  event_type?: EventType
  event_date?: string
  num_guests?: number
  message: string
  status: InquiryStatus
  responded_by?: string
  responded_at?: string
  response_notes?: string
  created_at: string
}

export interface EventReview {
  id: string
  booking_id: string
  customer_id: string
  rating: number
  review_text?: string
  photos: string[]
  is_approved: boolean
  is_featured: boolean
  created_at: string
  
  // Relations
  customer?: EventCustomer
  booking?: EventBooking
}

// ============================================================
// ENUMS
// ============================================================

export type EventType = 
  | 'birthday'
  | 'wedding'
  | 'corporate'
  | 'christening'
  | 'graduation'
  | 'anniversary'
  | 'reunion'
  | 'seminar'
  | 'product_launch'
  | 'team_building'
  | 'other'

export type MenuCategory = 
  | 'buffet'
  | 'plated'
  | 'drinks'
  | 'dessert'
  | 'appetizers'

export type AddonCategory = 
  | 'equipment'
  | 'entertainment'
  | 'decoration'
  | 'food'
  | 'service'
  | 'other'

export type BookingStatus = 
  | 'pending'      // Awaiting admin confirmation
  | 'confirmed'    // Admin approved, awaiting payment
  | 'paid'         // Fully paid
  | 'completed'    // Event finished
  | 'cancelled'    // Booking cancelled

export type PaymentStatus = 
  | 'pending'      // No payment yet
  | 'partial'      // Deposit paid
  | 'paid'         // Fully paid
  | 'refunded'     // Money refunded

export type PaymentType = 
  | 'deposit'
  | 'partial'
  | 'full'
  | 'refund'

export type PaymentMethod = 
  | 'cash'
  | 'bank_transfer'
  | 'gcash'
  | 'maya'
  | 'card'
  | 'check'

export type PaymentVerificationStatus = 
  | 'pending'
  | 'verified'
  | 'rejected'

export type InquiryStatus = 
  | 'new'
  | 'responded'
  | 'converted'    // Converted to booking
  | 'closed'

// ============================================================
// FORM TYPES (For booking flow)
// ============================================================

export interface BookingFormStep1 {
  event_type: EventType
  event_name: string
  event_date: string
  event_start_time: string
  event_end_time: string
  num_guests: number
}

export interface BookingFormStep2 {
  venue_id: string
  package_id?: string
  menu_package_id?: string
}

export interface BookingFormStep3 {
  addon_ids: string[]
  addon_quantities: Record<string, number>
}

export interface BookingFormStep4 {
  decorations_theme?: string
  decorations_notes?: string
  seating_arrangement?: string
  special_requests?: string
  dietary_restrictions?: string
}

export interface BookingFormStep5 {
  // Contact confirmation
  full_name: string
  email: string
  phone: string
  address?: string
}

export interface BookingFormData {
  step1: BookingFormStep1
  step2: BookingFormStep2
  step3: BookingFormStep3
  step4: BookingFormStep4
  step5: BookingFormStep5
}

// ============================================================
// HELPER TYPES
// ============================================================

export interface VenueAvailability {
  venue_id: string
  date: string
  is_available: boolean
  reason?: string // "Already booked", "Blocked for maintenance"
  existing_booking?: {
    booking_number: string
    event_type: EventType
    start_time: string
    end_time: string
  }
}

export interface PricingCalculation {
  venue_cost: number
  food_cost: number
  addons_cost: number
  subtotal: number
  service_charge: number
  tax: number
  total: number
  deposit_required: number
  balance_due: number
}

export interface BookingSummary {
  booking: EventBooking
  pricing: PricingCalculation
  timeline: BookingTimeline[]
}

export interface BookingTimeline {
  status: string
  label: string
  date?: string
  completed: boolean
  active: boolean
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface EventsAPIResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export interface EventsDashboardStats {
  total_bookings: number
  pending_bookings: number
  confirmed_bookings: number
  upcoming_events: number
  total_revenue: number
  pending_payments: number
  this_month_revenue: number
  this_month_bookings: number
}

export interface VenueUtilizationStats {
  venue_id: string
  venue_name: string
  total_bookings: number
  utilization_rate: number // percentage
  revenue_generated: number
}
