interface GoldDividerProps {
  className?: string
}

export function GoldDivider({ className = "" }: GoldDividerProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
    </div>
  )
}

// Thicker version
export function GoldDividerThick({ className = "" }: GoldDividerProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="h-[2px] bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
    </div>
  )
}

// With shadow effect like in the image
export function GoldDividerShadow({ className = "" }: GoldDividerProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 bg-gradient-to-b from-black/5 to-transparent"></div>
    </div>
  )
}

// With ornament in center
export function GoldDividerOrnament({ className = "" }: GoldDividerProps) {
  return (
    <div className={`w-full py-8 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-slate-300"></div>
          <div className="w-2 h-2 rotate-45 bg-amber-500"></div>
          <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-slate-300"></div>
        </div>
      </div>
    </div>
  )
}
