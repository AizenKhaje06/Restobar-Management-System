import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ManagerSidebar } from "@/components/manager/manager-sidebar"
import { ManagerHeader } from "@/components/manager/manager-header"

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has landing_page_manager or admin role
  const { data: userData } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (!userData || !['admin', 'landing_page_manager'].includes(userData.role)) {
    redirect("/unauthorized")
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <ManagerSidebar userRole={userData.role} userName={userData.full_name} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ManagerHeader userName={userData.full_name} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
