import { Button } from '@/components/ui/button'

export function OurStory() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Image */}
          <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden group bg-emerald-800">
            {/* Portrait Image */}
            <img 
              src="/lydia-portrait.png" 
              alt="Lydia De Roca" 
              className="absolute inset-0 w-full h-full object-contain"
            />
            
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            <div>
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Our Story
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                60 Years of
                <br />
                <span className="italic font-serif">Bringing Filipino</span>
                <br />
                <span className="italic font-serif">Flavors to Life!</span>
              </h2>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-4">
                Lydia De Roca and her husband Benigno started Lydia's Lechon in Baclaran in the 1960s with a dream to serve delicious, flavorful lechon to every Filipino home. Their iconic boneless lechon stuffed with seafood paella became an instant favorite, creating a brand that now has over 25 stores.
              </p>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Through their dedication, Lydia and Benigno created more than just a dish—they brought joy and tradition to every Filipino table, one delicious bite at a time. Today, Lydia's Lechon continues to honor their legacy, bringing the joy of Filipino cooking to every meal, whether for grand celebrations or simple everyday feasts. With each bite, we celebrate 60 years of passion, tradition, and happiness.
              </p>
            </div>

            {/* Stats - Updated */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1">60+</div>
                <div className="text-xs text-slate-300">Years of Tradition</div>
              </div>
              <div className="text-center border-x border-emerald-700">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1">25+</div>
                <div className="text-xs text-slate-300">Store Locations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1">1M+</div>
                <div className="text-xs text-slate-300">Happy Customers</div>
              </div>
            </div>

            {/* Button */}
            <div>
              <Button 
                variant="outline"
                className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white text-sm"
              >
                Read More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
