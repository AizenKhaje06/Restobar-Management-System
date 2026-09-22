"use client"

import { useEffect, useState, ReactNode } from "react"

export function ParallaxHero({ children }: { children: ReactNode }) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="relative">
      <div
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: "transform 0.1s ease-out"
        }}
      >
        {children}
      </div>
    </div>
  )
}
