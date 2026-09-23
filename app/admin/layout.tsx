import { redirect } from "next/navigation"
import { getSessionProfile } from "@/lib/auth"
import { getRestaurantSettings } from "@/lib/data/admin"
import { ROLE_HOME } from "@/lib/constants"
import { StaffShell, type NavSection } from "@/components/staff-shell"

const NAV: NavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
    ]
  },
  {
    label: "RESTAURANT OPS",
    items: [
      { href: "/admin/orders", label: "Orders", icon: "ClipboardList" },
      { href: "/admin/cashflow", label: "Cashflow", icon: "DollarSign" },
      { href: "/admin/remittances", label: "Remittances", icon: "Wallet" },
      { href: "/admin/menu", label: "Menu", icon: "UtensilsCrossed" },
      { href: "/admin/tables", label: "Tables", icon: "Grid3x3" },
      { href: "/admin/qr-codes", label: "QR Codes", icon: "ScanLine" },
      { href: "/admin/reservations", label: "Reservations", icon: "CalendarClock" },
    ]
  },
  {
    label: "EVENT MANAGEMENT",
    items: [
      { href: "/admin/events/bookings", label: "Event Bookings", icon: "Calendar" },
      { href: "/admin/events/payments", label: "Event Payments", icon: "CreditCard" },
      { href: "/admin/events/venues", label: "Event Venues", icon: "Building2" },
      { href: "/admin/events/packages", label: "Event Packages", icon: "Package" },
      { href: "/admin/events/menu", label: "Menu Packages", icon: "UtensilsCrossed" },
      { href: "/admin/events/gallery", label: "Gallery Manager", icon: "PartyPopper" },
      { href: "/admin/events/content", label: "Homepage Content", icon: "MessageSquare" },
      { href: "/admin/events/settings", label: "Event Settings", icon: "Settings" },
    ]
  },
  {
    label: "SYSTEM",
    items: [
      { href: "/admin/staff", label: "Staff", icon: "Users" },
      { href: "/admin/activity", label: "Activity Log", icon: "History" },
      { href: "/admin/settings", label: "Settings", icon: "Settings" },
    ]
  }
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [profile, settings] = await Promise.all([
    getSessionProfile(),
    getRestaurantSettings(),
  ])
  if (!profile) redirect("/login?next=/admin")
  if (profile.role !== "admin") redirect(ROLE_HOME[profile.role] ?? "/")

  return (
    <StaffShell
      profile={profile}
      items={NAV}
      title="Admin Console"
      restaurantName={settings?.name}
      restaurantTagline={settings?.tagline ?? undefined}
      restaurantLogo={settings?.logo_url ?? undefined}
    >
      {children}
    </StaffShell>
  )
}
