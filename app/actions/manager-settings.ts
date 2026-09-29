'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type LandingPageSettings = {
  id?: string
  business_name?: string
  tagline?: string
  about_text?: string
  phone?: string
  email?: string
  address?: string
  business_hours?: any
  facebook_url?: string
  instagram_url?: string
  twitter_url?: string
  youtube_url?: string
  hero_title?: string
  hero_subtitle?: string
  hero_image_url?: string
  hero_video_url?: string
  enable_online_ordering?: boolean
  enable_event_booking?: boolean
  enable_table_reservation?: boolean
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
}

// Get landing page settings
export async function getSettings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("landing_page_settings")
    .select("*")
    .single()

  if (error) {
    console.error("Error fetching settings:", error)
    return { settings: null, error: error.message }
  }

  return { settings: data, error: null }
}

// Update landing page settings
export async function updateSettings(settings: LandingPageSettings) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("landing_page_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq("id", settings.id || '00000000-0000-0000-0000-000000000001')

  if (error) {
    console.error("Error updating settings:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/settings")
  revalidatePath("/events")
  return { success: true, error: null }
}

// Update business hours
export async function updateBusinessHours(hours: any) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("landing_page_settings")
    .update({
      business_hours: hours,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq("id", '00000000-0000-0000-0000-000000000001')

  if (error) {
    console.error("Error updating business hours:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/settings")
  return { success: true, error: null }
}

// Update contact information
export async function updateContactInfo(contact: {
  phone?: string
  email?: string
  address?: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("landing_page_settings")
    .update({
      ...contact,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq("id", '00000000-0000-0000-0000-000000000001')

  if (error) {
    console.error("Error updating contact info:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/settings")
  return { success: true, error: null }
}

// Update social media links
export async function updateSocialMedia(social: {
  facebook_url?: string
  instagram_url?: string
  twitter_url?: string
  youtube_url?: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("landing_page_settings")
    .update({
      ...social,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq("id", '00000000-0000-0000-0000-000000000001')

  if (error) {
    console.error("Error updating social media:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/settings")
  return { success: true, error: null }
}

// Update hero section
export async function updateHeroSection(hero: {
  hero_title?: string
  hero_subtitle?: string
  hero_image_url?: string
  hero_video_url?: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("landing_page_settings")
    .update({
      ...hero,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq("id", '00000000-0000-0000-0000-000000000001')

  if (error) {
    console.error("Error updating hero section:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/settings")
  revalidatePath("/events")
  return { success: true, error: null }
}

// Toggle features
export async function toggleFeature(feature: string, enabled: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Not authenticated" }
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
    updated_by: user.id
  }

  if (feature === 'online_ordering') {
    updateData.enable_online_ordering = enabled
  } else if (feature === 'event_booking') {
    updateData.enable_event_booking = enabled
  } else if (feature === 'table_reservation') {
    updateData.enable_table_reservation = enabled
  }

  const { error } = await supabase
    .from("landing_page_settings")
    .update(updateData)
    .eq("id", '00000000-0000-0000-0000-000000000001')

  if (error) {
    console.error("Error toggling feature:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/manager/settings")
  return { success: true, error: null }
}
