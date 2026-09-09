import { redirect } from "next/navigation"
import { getSessionProfile } from "@/lib/auth"
import { ROLE_HOME } from "@/lib/constants"

export default async function HomePage() {
  // Check if user is already logged in
  const profile = await getSessionProfile()
  
  if (profile) {
    // If logged in, redirect to their role home
    redirect(ROLE_HOME[profile.role] ?? "/admin")
  }
  
  // If not logged in, redirect to login page
  redirect("/login")
}
