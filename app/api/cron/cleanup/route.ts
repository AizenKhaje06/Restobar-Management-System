/**
 * Session Cleanup Cron Job
 * 
 * Closes stale table sessions (inactive for 4+ hours)
 * 
 * Usage:
 * - Development: Call manually via GET /api/cron/cleanup
 * - Production: Configure Vercel Cron (vercel.json)
 * 
 * Security:
 * - Protected by CRON_SECRET in production
 * - Open in development for testing
 */

import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Security: Check authorization header (Vercel Cron sends this)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // In production, require CRON_SECRET
  if (process.env.NODE_ENV === 'production') {
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  try {
    const supabase = await createClient()

    // Call the cleanup function (closes sessions inactive > 4 hours)
    const { data, error } = await supabase.rpc('cleanup_stale_sessions', {
      p_timeout_hours: 4
    })

    if (error) {
      console.error('[Cleanup] Error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 500 }
      )
    }

    const result = Array.isArray(data) ? data[0] : data

    console.log('[Cleanup] Success:', {
      closed_count: result?.closed_count || 0,
      session_ids: result?.session_ids || [],
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      closed_count: result?.closed_count || 0,
      session_ids: result?.session_ids || [],
      timestamp: new Date().toISOString()
    })

  } catch (err) {
    console.error('[Cleanup] Exception:', err)
    return NextResponse.json(
      { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
