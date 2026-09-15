import { redirect } from "next/navigation"
import { getSessionProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { AdminRemittancesClient } from "@/components/admin/remittances-client"

export default async function AdminRemittancesPage() {
  const profile = await getSessionProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "admin") {
    redirect("/")
  }

  const supabase = await createClient()

  // Get all remittances with staff details
  const { data: remittances, error } = await supabase
    .from("cash_remittances")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching remittances:", error)
    
    // If table doesn't exist, show setup message
    if (error.message?.includes("does not exist") || error.code === "42P01") {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="mb-4 p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 w-16 h-16 mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Setup Required</h1>
            <p className="text-muted-foreground mb-4">
              The cash remittances table hasn't been created yet.
            </p>
            <div className="text-left bg-muted/50 p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">To setup:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Open Supabase Dashboard → SQL Editor</li>
                <li>Run the file: <code className="text-xs bg-muted px-1 py-0.5 rounded">supabase/create_cash_remittances.sql</code></li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      )
    }
  }

  // Fetch staff details separately to avoid foreign key issues
  let enrichedRemittances = remittances || []
  
  if (remittances && remittances.length > 0) {
    const staffIds = new Set<string>()
    remittances.forEach((r: any) => {
      if (r.remitted_by) staffIds.add(r.remitted_by)
      if (r.received_by) staffIds.add(r.received_by)
    })

    if (staffIds.size > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", Array.from(staffIds))

      const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])

      enrichedRemittances = remittances.map((r: any) => ({
        ...r,
        remitter: r.remitted_by ? profileMap.get(r.remitted_by) : null,
        receiver: r.received_by ? profileMap.get(r.received_by) : null,
      }))
    }
  }

  return (
    <AdminRemittancesClient
      profile={profile}
      initialRemittances={enrichedRemittances}
    />
  )
}
