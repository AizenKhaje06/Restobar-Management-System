'use client'

import { ReactNode } from 'react'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

interface AnimationProps {
  children: ReactNode
  className?: string
  delay?: number
}

// Fade Up Animation - Safe for most sections
export function FadeUp({ children, className = '', delay = 0 }: AnimationProps) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Scale + Fade - For images and featured sections
export function ScaleFade({ children, className = '', delay = 0 }: AnimationProps) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-95'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Slide from Left
export function SlideLeft({ children, className = '', delay = 0 }: AnimationProps) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 -translate-x-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Slide from Right
export function SlideRight({ children, className = '', delay = 0 }: AnimationProps) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Stagger Container - For cards/lists
export function StaggerContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div ref={ref} className={className}>
      {isVisible && children}
    </div>
  )
}

// Stagger Item - Individual card in stagger animation
export function StaggerItem({ children, index, className = '' }: AnimationProps & { index: number }) {
  return (
    <div
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        animation: 'fadeUpStagger 0.6s ease-out forwards',
        animationDelay: `${index * 100}ms`,
        opacity: 0
      }}
    >
      {children}
    </div>
  )
}

// Reveal/Clip Animation
export function RevealClip({ children, className = '' }: AnimationProps) {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out overflow-hidden ${className}`}
      style={{
        clipPath: isVisible
          ? 'inset(0 0 0 0)'
          : 'inset(0 0 100% 0)'
      }}
    >
      {children}
    </div>
  )
}
