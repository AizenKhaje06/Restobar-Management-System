"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  CalendarDays, 
  Menu, 
  X,
  Home,
  Building2,
  Package,
  ImageIcon,
  Phone,
  User,
  LogOut,
  Settings,
  UtensilsCrossed
} from "lucide-react"
import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function EventsNavbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session and check for customer profile
    const checkCustomer = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if this user has a customer profile in event_customers table
        const { data: customer } = await supabase
          .from("event_customers")
          .select("id")
          .eq("auth_id", user.id)
          .maybeSingle()
        
        // Only set user if they have a customer profile
        if (customer) {
          setUser(user)
        } else {
          // User has auth but no customer profile - sign them out
          await supabase.auth.signOut()
          setUser(null)
        }
      }
      
      setLoading(false)
    }
    
    checkCustomer()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Check if this user has a customer profile
        const { data: customer } = await supabase
          .from("event_customers")
          .select("id")
          .eq("auth_id", session.user.id)
          .maybeSingle()
        
        // Only set user if they have a customer profile
        setUser(customer ? session.user : null)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setShowUserMenu(false)
    router.push("/events")
    router.refresh()
  }

  const navLinks = [
    { href: "/events", label: "Home", icon: Home },
    { href: "/events/venues", label: "Venues", icon: Building2 },
    { href: "/events/packages", label: "Packages", icon: Package },
    { href: "/events/menu", label: "Menu", icon: UtensilsCrossed },
    { href: "/events/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/events/contact", label: "Contact", icon: Phone },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/events" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <CalendarDays className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hidden sm:block">
              Event Venue
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                        <User className="size-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">Account</span>
                    </button>

                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg py-2 z-20 animate-in slide-in-from-top-5">
                          <Link
                            href="/events/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                          >
                            <Home className="size-4" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            href="/events/dashboard/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors"
                          >
                            <Settings className="size-4" />
                            <span>Settings</span>
                          </Link>
                          <div className="border-t my-2" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted transition-colors text-red-600 dark:text-red-400"
                          >
                            <LogOut className="size-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/events/login">
                      <Button variant="ghost" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/events/book">
                      <Button size="sm" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md">
                        Book Now
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t animate-in slide-in-from-top-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="size-4 text-muted-foreground" />
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
            <div className="px-4 py-2 flex flex-col gap-2 border-t pt-4">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <Link href="/events/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <User className="size-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/events/dashboard/profile" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          <Settings className="size-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          handleLogout()
                        }}
                        variant="outline"
                        className="w-full text-red-600 dark:text-red-400 border-red-600 dark:border-red-400"
                      >
                        <LogOut className="size-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/events/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Customer Login
                        </Button>
                      </Link>
                      <Link href="/events/book" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
                          Book Event Now
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
