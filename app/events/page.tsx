import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Award, 
  Heart,
  ChevronRight,
  ChevronDown,
  Star,
  Users
} from "lucide-react"
import { TestimonialsSection } from "@/components/events/testimonials-section"
import { DigitalPartners } from "@/components/events/digital-partners"
import { FAQSection } from "@/components/events/faq-section"
import { MediaFeatures } from "@/components/events/media-features"
import { VideoModal } from "@/components/events/video-modal"
import { FeaturesSection } from "@/components/events/features-section"
import { SignatureDishes } from "@/components/restaurant/signature-dishes"
import { OurStory } from "@/components/restaurant/our-story"
import { MomentsGallery } from "@/components/restaurant/moments-gallery"
import { EventsPlace } from "@/components/restaurant/events-place"
import { FoodCategories } from "@/components/restaurant/food-categories"
import { ValueSection } from "@/components/restaurant/value-section"
import { BookingForm } from "@/components/restaurant/booking-form"
import { WaveDivider } from "@/components/ui/wave-divider"
import { FadeUp, ScaleFade } from "@/components/ui/scroll-animations"
import { GoldDivider } from "@/components/ui/gold-divider"

export const metadata = {
  title: "Lumière Restaurant - Fine Dining Experience in Manila",
  description:
    "Experience culinary excellence at Lumière Restaurant. Award-winning chefs, fresh ingredients, and an unforgettable dining atmosphere. Reserve your table today!",
  keywords: "fine dining Manila, restaurant Philippines, best food Manila, gourmet restaurant, luxury dining, table reservation Manila",
  openGraph: {
    title: "Lumière Restaurant - Fine Dining Experience in Manila",
    description: "Experience culinary excellence with award-winning chefs, fresh ingredients, and exceptional service.",
    type: "website",
    url: "https://yourdomain.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lumière Restaurant"
      }
    ]
  }
}

export default async function EventsLandingPage() {
  // Structured Data for Restaurant SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Lumière Restaurant",
    "description": "Fine dining restaurant in Manila offering exquisite cuisine and exceptional service",
    "url": "https://yourdomain.com",
    "telephone": "+639171234567",
    "email": "info@restaurant.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street",
      "addressLocality": "Manila",
      "addressCountry": "Philippines",
      "postalCode": "1000"
    },
    "servesCuisine": ["International", "Asian Fusion", "Fine Dining"],
    "priceRange": "₱₱₱",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "11:00",
      "closes": "22:00"
    }
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

    <div className="flex flex-col">
      {/* Hero Section - Content on Left Side */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/LydiasBG2.png" 
            alt="Lumière Events Background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Dark Overlay for Text Readability - Stronger on Left */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent lg:from-black lg:via-black/50"></div>
        
        <div className="relative z-10 px-4 lg:px-20 py-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - All Content */}
            <div className="text-center lg:text-left lg:pr-8">
              {/* Tagline */}
              <div className="mb-3 animate-in fade-in slide-in-from-top duration-700">
                <p className="text-amber-400 text-sm md:text-base font-semibold tracking-[0.2em] uppercase">
                  Crafted by Tradition. Loved for Generations.
                </p>
              </div>

              {/* Main Heading */}
              <h1 className="mb-5 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                60 Years of
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  Legendary Lechon
                </span>
              </h1>

              {/* Subheading */}
              <p className="mb-8 text-lg text-slate-300 md:text-xl animate-in fade-in slide-in-from-bottom duration-700 delay-300 leading-relaxed">
                Since 1965, Lydia's Lechon has perfected the art of authentic Filipino lechon—bringing together rich heritage, signature crispy skin, and unforgettable flavor for every celebration.
              </p>

              {/* CTA Buttons - Side by side on mobile */}
              <div className="flex flex-row items-center justify-center lg:justify-start gap-3 mb-6 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
                <Link href="/order">
                  <Button 
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg font-semibold shadow-2xl shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                      Book A Table
                      <ChevronRight className="size-4 sm:size-5 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  </Button>
                </Link>
                
                <Link href="/events/venues">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="group border-2 border-amber-400/50 bg-amber-400/20 backdrop-blur-sm hover:bg-amber-400 hover:border-amber-400 text-amber-100 hover:text-slate-900 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg font-semibold transition-all shadow-lg shadow-amber-500/20"
                  >
                    <span className="flex items-center gap-1 sm:gap-2">
                      Book A Venue
                      <ChevronRight className="size-4 sm:size-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <p className="text-xs sm:text-sm text-slate-400 mb-10 animate-in fade-in duration-700 delay-500">
                ✓ Fresh ingredients daily • ✓ Award-winning chefs • ✓ Cozy atmosphere
              </p>

              {/* Trust Indicators - Horizontal Layout with Icons Left, Text Right */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { icon: Award, label: "500+ Events", sublabel: "Successfully Hosted" },
                  { icon: Star, label: "5.0 Rating", sublabel: "Customer Reviews" },
                  { icon: Users, label: "50,000+", sublabel: "Happy Guests" },
                  { icon: Heart, label: "100%", sublabel: "Satisfaction Rate" },
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4"
                    style={{
                      animationDelay: `${600 + (i * 100)}ms`,
                      animationDuration: '600ms'
                    }}
                  >
                    {/* Icon on Left */}
                    <stat.icon className="size-8 sm:size-10 text-amber-500 flex-shrink-0 animate-in zoom-in" 
                      style={{
                        animationDelay: `${700 + (i * 100)}ms`,
                        animationDuration: '400ms'
                      }}
                    />
                    {/* Text on Right */}
                    <div className="flex flex-col items-start">
                      <div className="text-base sm:text-xl font-bold text-white leading-tight">{stat.label}</div>
                      <div className="text-xs sm:text-sm text-slate-400 leading-tight">{stat.sublabel}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Side - Empty Space (Image shows through) */}
            <div className="hidden lg:block"></div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-slate-400 cursor-pointer hover:text-amber-400 transition-colors">
            <span className="text-xs uppercase tracking-wider font-medium">Scroll to explore</span>
            <ChevronDown className="size-5" />
          </div>
        </div>
      </section>

      {/* Features Section ✅ */}
      <FadeUp>
        <FeaturesSection />
      </FadeUp>

      {/* Media Features 🆕 - Early Credibility */}
      <FadeUp>
        <MediaFeatures />
      </FadeUp>

      {/* Signature Dishes - 2x2 Grid 🆕 */}
      <div id="menu">
        <ScaleFade>
          <SignatureDishes />
        </ScaleFade>
      </div>

      {/* Food Categories 🆕 */}
      <div id="packages">
        <FadeUp>
          <FoodCategories />
        </FadeUp>
      </div>

      {/* Wave Divider - White wave over dark Our Story background */}
      <WaveDivider topColor="fill-slate-100" className="-mb-1" />

      {/* Our Story Section 🆕 */}
      <OurStory />

      {/* Events Place Section 🆕 */}
      <div id="venues">
        <EventsPlace />
      </div>

      {/* Moments Gallery 🆕 */}
      <div id="gallery">
        <MomentsGallery />
      </div>

      {/* Value Section 🆕 */}
      <ValueSection />

      {/* Testimonials ✅ */}
      <ScaleFade>
        <TestimonialsSection />
      </ScaleFade>

      {/* Digital Partners 🆕 */}
      <FadeUp>
        <DigitalPartners />
      </FadeUp>

      {/* FAQ Section 🆕 */}
      <FadeUp>
        <FAQSection />
      </FadeUp>

      {/* Booking Form 🆕 */}
      <ScaleFade>
        <BookingForm />
      </ScaleFade>

      {/* Final CTA Section ✅ */}
      <FadeUp>
        <section className="relative py-16 sm:py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/LydiasBG3.png" 
            alt="Lumière Restaurant"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80"></div>
        
        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready for a
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
              Delicious Experience?
            </span>
          </h2>
          
          <p className="text-base sm:text-lg text-slate-300 mb-8 sm:mb-10 max-w-2xl mx-auto">
            Book your table now and enjoy a memorable meal at Lumière Restaurant
          </p>

          <Link href="/order">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all"
            >
              Book A Table
            </Button>
          </Link>
        </div>
      </section>
      </FadeUp>
    </div>
    </>
  )
}
