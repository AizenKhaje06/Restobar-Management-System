# 🎨 EVENT LANDING PAGE - BUILD PROGRESS

## ✅ **FILES CREATED**

### Page Structure
1. ✅ `app/events/page.tsx` - Main landing page
2. ✅ `app/events/layout.tsx` - Events layout wrapper

### Components
3. ✅ `components/events/hero-section.tsx` - Hero with CTA

---

## 📋 **REMAINING COMPONENTS TO CREATE**

### Navigation & Footer
```typescript
// components/events/events-navbar.tsx
- Logo and branding
- Navigation links (Home, Venues, Packages, Gallery, Contact)
- "Book Now" CTA button
- Customer Login link
- Staff Login link (small)
- Mobile responsive menu

// components/events/events-footer.tsx
- Contact information
- Quick links
- Social media icons
- Copyright
- Privacy/Terms links
```

### Home Page Sections
```typescript
// components/events/stats-section.tsx
- Trust indicators
- Success metrics
- Awards/certifications

// components/events/venue-preview.tsx
- Grid of venue cards
- 3 featured venues
- "View All Venues" link

// components/events/package-preview.tsx
- Featured packages grid
- Pricing cards
- "View All Packages" button

// components/events/testimonials-section.tsx
- Customer reviews
- Star ratings
- Photo carousel
- Real testimonials

// components/events/cta-section.tsx
- Final call-to-action
- Contact details
- Booking encouragement
```

### Reusable Cards
```typescript
// components/events/venue-card.tsx
- Venue photo
- Name, location
- Capacity range
- Base price
- Amenities icons
- "View Details" button

// components/events/package-card.tsx
- Package photo
- Name, event type
- Price per person
- Inclusions list
- "Choose Package" button
```

---

## 🎨 **DESIGN SYSTEM**

### Color Palette (Elegant)
```css
Primary: Amber/Gold (#D97706, #F59E0B)
Secondary: Orange (#EA580C)
Accent: Rose (#E11D48)
Background: White/Slate
Text: Zinc-900 / Zinc-50 (dark mode)
```

### Typography
```
Headings: font-black, tracking-tight
Body: font-medium
Sizes: text-5xl, text-3xl, text-xl, text-base
```

### Spacing
```
Sections: py-16 sm:py-20
Containers: container mx-auto px-4
Gaps: gap-8, gap-12
```

### Effects
```
Gradients: from-amber-600 to-orange-600
Shadows: shadow-xl, shadow-2xl
Blur: backdrop-blur-sm
Transitions: transition-all, hover effects
```

---

## 📄 **COMPLETE COMPONENT CODE**

### 1. Events Navbar

```typescript
// components/events/events-navbar.tsx
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
  Phone
} from "lucide-react"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

export function EventsNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: "/events", label: "Home", icon: Home },
    { href: "/events/venues", label: "Venues", icon: Building2 },
    { href: "/events/packages", label: "Packages", icon: Package },
    { href: "/events/gallery", label: "Gallery", icon: ImageIcon },
    { href: "/events/contact", label: "Contact", icon: Phone },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/events" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
              <CalendarDays className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold hidden sm:block">
              Your Restaurant
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
            <Link href="/events/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/events/book">
              <Button size="sm" className="bg-gradient-to-r from-amber-600 to-orange-600">
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-2 flex flex-col gap-2">
              <Link href="/events/login">
                <Button variant="outline" className="w-full">
                  Customer Login
                </Button>
              </Link>
              <Link href="/events/book">
                <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600">
                  Book Event Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
```

### 2. Events Footer

```typescript
// components/events/events-footer.tsx
import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"

export function EventsFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">Your Restaurant</h3>
            <p className="text-sm text-muted-foreground">
              Creating unforgettable events since 2020. Your perfect venue for every special moment.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events/venues" className="hover:underline">Venues</Link></li>
              <li><Link href="/events/packages" className="hover:underline">Packages</Link></li>
              <li><Link href="/events/gallery" className="hover:underline">Gallery</Link></li>
              <li><Link href="/events/contact" className="hover:underline">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="size-4" />
                <span>+63 917 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" />
                <span>events@restaurant.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-4 mt-0.5" />
                <span>123 Main St, Manila, Philippines</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground hover:opacity-80"
              >
                <Facebook className="size-5" />
              </a>
              <a 
                href="#" 
                className="flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground hover:opacity-80"
              >
                <Instagram className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 Your Restaurant. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/login" className="text-xs">Staff Login</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

### 3. Venue Preview Component

```typescript
// components/events/venue-preview.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Users } from "lucide-react"
import type { EventVenue } from "@/lib/types/events"

export function VenuePreview({ venues }: { venues: EventVenue[] }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {venues.slice(0, 3).map((venue) => (
          <Card key={venue.id} className="overflow-hidden group hover:shadow-xl transition-all">
            {/* Image */}
            <div className="aspect-video bg-muted relative overflow-hidden">
              {venue.photos[0] ? (
                <img 
                  src={venue.photos[0]} 
                  alt={venue.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-100 to-orange-100">
                  <MapPin className="size-12 text-amber-600" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{venue.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {venue.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Users className="size-4" />
                  <span>{venue.capacity_min}-{venue.capacity_max} pax</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  <span>{venue.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Starting at</p>
                  <p className="text-2xl font-bold text-amber-600">
                    ₱{venue.base_rate.toLocaleString()}
                  </p>
                </div>
                <Link href={`/events/venues/${venue.id}`}>
                  <Button variant="outline">View Details</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Link href="/events/venues">
          <Button size="lg" variant="outline">
            View All Venues
          </Button>
        </Link>
      </div>
    </div>
  )
}
```

---

## 🚀 **NEXT STEPS**

### Phase 2A: Complete Landing Page ⏳
1. Create remaining components:
   - [ ] StatsSection
   - [ ] PackagePreview
   - [ ] TestimonialsSection
   - [ ] CTASection

2. Create navbar and footer
3. Add venue details page
4. Add packages page

### Phase 2B: Additional Pages 📋
- [ ] `/events/venues` - All venues
- [ ] `/events/venues/[id]` - Venue details
- [ ] `/events/packages` - All packages
- [ ] `/events/packages/[slug]` - Package details
- [ ] `/events/gallery` - Photo gallery
- [ ] `/events/contact` - Contact form

---

## 💡 **CUSTOMIZATION NEEDED**

Replace placeholders with your actual:
- [ ] Restaurant name
- [ ] Logo
- [ ] Contact information (phone, email, address)
- [ ] Social media links
- [ ] Brand colors (if different from amber/orange)
- [ ] Actual venue photos
- [ ] Real testimonials

---

**Status:** Landing Page - 30% Complete  
**Next:** Create remaining components and pages

**Ready to continue? Let me know!** 🎨
