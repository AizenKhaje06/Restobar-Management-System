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
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-9 rounded-full bg-slate-800 text-slate-400 hover:bg-amber-600 hover:text-white transition-all"
                aria-label="Facebook"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center size-9 rounded-full bg-slate-800 text-slate-400 hover:bg-gradient-to-br hover:from-pink-500 hover:to-rose-600 hover:text-white transition-all"
                aria-label="Instagram"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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
