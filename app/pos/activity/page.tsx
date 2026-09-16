import { redirect } from "next/navigation"
import { getSessionProfile } from "@/lib/auth"
import { getStaffActivityLogs } from "@/lib/data/pos"
import { PosActivityManager } from "@/components/pos/activity-manager"

export default async function PosActivityPage() {
  const profile = await getSessionProfile()
  if (!profile) {
    redirect("/login")
    return
  }
  if (profile.role !== "pos") {
    redirect("/")
    return
  }

  const activityLogs = await getStaffActivityLogs(profile.id, 100)

  return <PosActivityManager activityLogs={activityLogs} staffName={profile.full_name || "Unknown"} />
}
