import { describe, it, expect } from '@jest/globals'
import { formatCurrency, formatDateTime, formatTime, relativeTime, computeTotals } from '@/lib/constants'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(100)).toBe('₱100.00')
      expect(formatCurrency(1234.56)).toBe('₱1,234.56')
      expect(formatCurrency(0)).toBe('₱0.00')
    })

    it('should handle decimal places', () => {
      expect(formatCurrency(99.99)).toBe('₱99.99')
      expect(formatCurrency(100.1)).toBe('₱100.10')
    })
  })

  describe('computeTotals', () => {
    it('should compute totals with 12% tax', () => {
      const result = computeTotals(100)
      expect(result.subtotal).toBe(100)
      expect(result.tax).toBe(12)
      expect(result.total).toBe(112)
    })

    it('should handle zero subtotal', () => {
      const result = computeTotals(0)
      expect(result.subtotal).toBe(0)
      expect(result.tax).toBe(0)
      expect(result.total).toBe(0)
    })

    it('should round correctly', () => {
      const result = computeTotals(99.99)
      expect(result.tax).toBe(12.00)
      expect(result.total).toBe(111.99)
    })
  })

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2024-01-15T14:30:00')
      const formatted = formatDateTime(date)
      expect(formatted).toMatch(/Jan 15/)
      expect(formatted).toMatch(/2:30/)
    })
  })

  describe('formatTime', () => {
    it('should format time only', () => {
      const date = new Date('2024-01-15T14:30:00')
      const formatted = formatTime(date)
      expect(formatted).toMatch(/2:30/)
    })
  })

  describe('relativeTime', () => {
    it('should show "just now" for recent times', () => {
      const now = new Date()
      expect(relativeTime(now)).toBe('just now')
    })

    it('should show minutes ago', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(relativeTime(fiveMinutesAgo)).toBe('5m ago')
    })

    it('should show hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      expect(relativeTime(twoHoursAgo)).toBe('2h ago')
    })

    it('should show days ago', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      expect(relativeTime(threeDaysAgo)).toBe('3d ago')
    })
  })
})
