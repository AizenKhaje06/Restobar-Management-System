import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Hook for subscribing to real-time updates on a Supabase table
 * Automatically updates local state when database changes occur
 */
export function useRealtimeData<T extends { id: string }>(
  table: string,
  initialData: T[],
  options?: {
    filter?: { column: string; value: any }
    onInsert?: (record: T) => void
    onUpdate?: (record: T) => void
    onDelete?: (record: T) => void
  }
) {
  const [data, setData] = useState<T[]>(initialData)

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    // Build the subscription
    const subscriptionConfig: any = {
      event: '*',
      schema: 'public',
      table: table,
    }

    if (options?.filter) {
      subscriptionConfig.filter = `${options.filter.column}=eq.${options.filter.value}`
    }

    channel = supabase
      .channel(`realtime-${table}`)
      .on('postgres_changes', subscriptionConfig, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newRecord = payload.new as T
          setData((prev) => {
            // Avoid duplicates
            if (prev.some((item) => item.id === newRecord.id)) return prev
            return [...prev, newRecord]
          })
          options?.onInsert?.(newRecord)
        } else if (payload.eventType === 'UPDATE') {
          const updatedRecord = payload.new as T
          setData((prev) =>
            prev.map((item) => (item.id === updatedRecord.id ? updatedRecord : item))
          )
          options?.onUpdate?.(updatedRecord)
        } else if (payload.eventType === 'DELETE') {
          const deletedRecord = payload.old as T
          setData((prev) => prev.filter((item) => item.id !== deletedRecord.id))
          options?.onDelete?.(deletedRecord)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, options?.filter?.column, options?.filter?.value])

  return data
}

/**
 * Hook for subscribing to real-time updates with custom query refresh
 * Refetches data from the server when changes occur
 */
export function useRealtimeRefresh(
  table: string,
  onRefresh: () => void,
  options?: {
    filter?: { column: string; value: any }
    debounceMs?: number
  }
) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel
    let debounceTimer: NodeJS.Timeout | null = null

    const handleChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      
      debounceTimer = setTimeout(() => {
        onRefresh()
      }, options?.debounceMs ?? 500)
    }

    const subscriptionConfig: any = {
      event: '*',
      schema: 'public',
      table: table,
    }

    if (options?.filter) {
      subscriptionConfig.filter = `${options.filter.column}=eq.${options.filter.value}`
    }

    channel = supabase
      .channel(`realtime-refresh-${table}`)
      .on('postgres_changes', subscriptionConfig, handleChange)
      .subscribe()

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [table, onRefresh, options?.filter?.column, options?.filter?.value, options?.debounceMs])
}
