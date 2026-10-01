import Link from "next/link"
import { Mail, MapPin, Phone, Utensils } from "lucide-react"

export function EventsFooter() {
  return (
    <footer id="contact" className="border-t bg-slate-900 text-slate-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                <Utensils className="size-5 text-white" />
              </div>
              <h3 className="font-bold text-lg text-white">Lumière</h3>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Experience culinary excellence with fresh ingredients, skilled chefs, and a warm atmosphere. Where every meal becomes a memory.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/lydiaslechonrestaurant" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-9 rounded-full bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                aria-label="Facebook"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/lydiaslechon" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-9 rounded-full bg-slate-800 text-slate-400 hover:bg-gradient-to-br hover:from-pink-500 hover:to-rose-600 hover:text-white transition-all"
                aria-label="Instagram"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://www.tiktok.com/@lydias_lechon" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-9 rounded-full bg-slate-800 text-slate-400 hover:bg-black hover:text-white transition-all"
                aria-label="TikTok"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://www.youtube.com/@lydias_lechon" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-9 rounded-full bg-slate-800 text-slate-400 hover:bg-red-600 hover:text-white transition-all"
                aria-label="YouTube"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/lydias-lechon" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-9 rounded-full bg-slate-800 text-slate-400 hover:bg-blue-700 hover:text-white transition-all"
                aria-label="LinkedIn"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a 
                href="https://www.google.com/search?hl=en&authuser=0&sxsrf=AE3TifNeu80u8YCKIgkpWTQMqFELy-dKfw%3A1754701741152&kgmid=%2Fg%2F1wk7ndj1&q=Lydia%27s%20Lechon%20-%20The%20Best%20Lechon%20in%20Manila&shndl=30&shem=lcuae%2Clsptb1%2Csdl1pl%2Cuaasie&kgs=72289e3bac2b94eb" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-9 rounded-full bg-slate-800 text-slate-400 hover:bg-gradient-to-br hover:from-blue-500 hover:via-red-500 hover:to-yellow-500 hover:text-white transition-all"
                aria-label="Google"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/events/menu" className="hover:text-amber-400 transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/order" className="hover:text-amber-400 transition-colors">
                  Order Online
                </Link>
              </li>
              <li>
                <Link href="/events/gallery" className="hover:text-amber-400 transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/events/contact" className="hover:text-amber-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Our Menu */}
          <div>
            <h3 className="font-bold mb-4 text-white">Our Menu</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events/menu" className="hover:text-amber-400 transition-colors">
                  Appetizers
                </Link>
              </li>
              <li>
                <Link href="/events/menu" className="hover:text-amber-400 transition-colors">
                  Main Course
                </Link>
              </li>
              <li>
                <Link href="/events/menu" className="hover:text-amber-400 transition-colors">
                  Burgers
                </Link>
              </li>
              <li>
                <Link href="/events/menu" className="hover:text-amber-400 transition-colors">
                  Desserts
                </Link>
              </li>
              <li>
                <Link href="/events/menu" className="hover:text-amber-400 transition-colors">
                  Drinks
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="font-bold mb-4 text-white">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-amber-400" />
                <span>+63 917 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-amber-400" />
                <span>info@restaurant.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="size-4 shrink-0 mt-0.5 text-amber-400" />
                <span>123 Main Street, Manila, Philippines 1000</span>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="font-semibold text-white mb-2 text-sm">Opening Hours</p>
              <p className="text-xs">Monday - Sunday</p>
              <p className="text-xs">11:00 AM - 10:00 PM</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2025 Lumière Restaurant. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-amber-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-amber-400 transition-colors">
              Staff Login →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
