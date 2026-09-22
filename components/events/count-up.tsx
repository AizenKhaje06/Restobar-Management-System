"use client"

import { useEffect, useRef, useState } from "react"

type CountUpProps = {
  end: number
  duration?: number
  suffix?: string
  className?: string
}

export function CountUp({ end, duration = 2000, suffix = "", className = "" }: CountUpProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)
            
            const startTime = Date.now()
            const endTime = startTime + duration

            const updateCount = () => {
              const now = Date.now()
              const progress = Math.min((now - startTime) / duration, 1)
              
              // Easing function for smooth animation
              const easeOutQuad = (t: number) => t * (2 - t)
              const currentCount = Math.floor(easeOutQuad(progress) * end)
              
              setCount(currentCount)

              if (now < endTime) {
                requestAnimationFrame(updateCount)
              } else {
                setCount(end)
              }
            }

            requestAnimationFrame(updateCount)
          }
        })
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [end, duration, hasAnimated])

  return (
    <span ref={ref} className={className}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}
