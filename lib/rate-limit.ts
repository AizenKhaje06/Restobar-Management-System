/**
 * Rate Limiting Utility
 * 
 * Simple in-memory rate limiter for development.
 * For production with multiple instances, use Redis (Upstash) or database.
 * 
 * Features:
 * - Sliding window algorithm
 * - Multiple action types
 * - Configurable limits and windows
 * - Automatic cleanup of expired entries
 */

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  identifier: string
  action: string
}

interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  lastAttempt: number
}

// In-memory store (resets on server restart)
// Key format: "action:identifier" (e.g., "login:192.168.1.1" or "pin_join:table_123")
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  const maxAge = 60 * 60 * 1000 // 1 hour

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastAttempt > maxAge) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Check if an action is rate limited
 * 
 * @param config - Rate limit configuration
 * @returns { allowed: true } if allowed, { allowed: false, retryAfter: ms } if rate limited
 */
export function checkRateLimit(config: RateLimitConfig): {
  allowed: boolean
  retryAfter?: number
  remaining?: number
} {
  const key = `${config.action}:${config.identifier}`
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // No previous attempts
  if (!entry) {
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
    })
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
    }
  }

  // Check if window has expired (sliding window)
  const windowStart = now - config.windowMs
  if (entry.firstAttempt < windowStart) {
    // Window expired, reset
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
    })
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
    }
  }

  // Within window, check if limit exceeded
  if (entry.attempts >= config.maxAttempts) {
    const retryAfter = entry.firstAttempt + config.windowMs - now
    return {
      allowed: false,
      retryAfter: Math.max(0, retryAfter),
    }
  }

  // Increment attempts
  entry.attempts++
  entry.lastAttempt = now
  rateLimitStore.set(key, entry)

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.attempts,
  }
}

/**
 * Reset rate limit for an identifier (e.g., on successful login)
 */
export function resetRateLimit(action: string, identifier: string): void {
  const key = `${action}:${identifier}`
  rateLimitStore.delete(key)
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(action: string, identifier: string): {
  attempts: number
  remaining: number
  resetAt: number
} | null {
  const key = `${action}:${identifier}`
  const entry = rateLimitStore.get(key)

  if (!entry) {
    return null
  }

  // Assuming default config (should match checkRateLimit configs)
  const maxAttempts = getMaxAttemptsForAction(action)
  const windowMs = getWindowForAction(action)
  const resetAt = entry.firstAttempt + windowMs

  return {
    attempts: entry.attempts,
    remaining: Math.max(0, maxAttempts - entry.attempts),
    resetAt,
  }
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  // Table sessions
  PIN_JOIN: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  
  // Staff management
  STAFF_CREATE: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  
  // QR code scanning
  QR_SCAN: {
    maxAttempts: 20,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // Order creation
  ORDER_CREATE: {
    maxAttempts: 30,
    windowMs: 60 * 1000, // 1 minute
  },
} as const

/**
 * Helper: Get max attempts for action
 */
function getMaxAttemptsForAction(action: string): number {
  switch (action) {
    case 'login':
      return RATE_LIMITS.LOGIN.maxAttempts
    case 'pin_join':
      return RATE_LIMITS.PIN_JOIN.maxAttempts
    case 'staff_create':
      return RATE_LIMITS.STAFF_CREATE.maxAttempts
    case 'qr_scan':
      return RATE_LIMITS.QR_SCAN.maxAttempts
    case 'order_create':
      return RATE_LIMITS.ORDER_CREATE.maxAttempts
    default:
      return 10 // Default
  }
}

/**
 * Helper: Get window for action
 */
function getWindowForAction(action: string): number {
  switch (action) {
    case 'login':
      return RATE_LIMITS.LOGIN.windowMs
    case 'pin_join':
      return RATE_LIMITS.PIN_JOIN.windowMs
    case 'staff_create':
      return RATE_LIMITS.STAFF_CREATE.windowMs
    case 'qr_scan':
      return RATE_LIMITS.QR_SCAN.windowMs
    case 'order_create':
      return RATE_LIMITS.ORDER_CREATE.windowMs
    default:
      return 5 * 60 * 1000 // Default 5 minutes
  }
}

/**
 * Get client IP address from request headers
 * Works with Vercel, Cloudflare, and other proxies
 */
export function getClientIp(headers: Headers): string {
  // Try various headers in order of preference
  const candidates = [
    headers.get('x-forwarded-for')?.split(',')[0].trim(),
    headers.get('x-real-ip'),
    headers.get('cf-connecting-ip'), // Cloudflare
    headers.get('x-vercel-forwarded-for'), // Vercel
    '127.0.0.1', // Fallback for development
  ]

  for (const candidate of candidates) {
    if (candidate) {
      return candidate
    }
  }

  return '127.0.0.1' // Default fallback
}

/**
 * Format retry-after duration in human-readable format
 */
export function formatRetryAfter(ms: number): string {
  const seconds = Math.ceil(ms / 1000)

  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`
  }

  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}

/**
 * Create rate limit error message
 */
export function createRateLimitError(retryAfter: number): string {
  return `Too many attempts. Please try again in ${formatRetryAfter(retryAfter)}.`
}
