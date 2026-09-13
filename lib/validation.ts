/**
 * Input Validation & Sanitization Utilities
 * 
 * Provides consistent validation and sanitization across the application.
 * Prevents injection attacks, data corruption, and ensures data quality.
 */

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean
  error?: string
  sanitized?: string
}

/**
 * Username validation
 * - 3-20 characters
 * - Alphanumeric + underscore only
 * - Lowercase
 */
export function validateUsername(username: string): ValidationResult {
  const trimmed = username.trim().toLowerCase()

  if (!trimmed) {
    return { valid: false, error: 'Username is required' }
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' }
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Username must be no more than 20 characters' }
  }

  if (!/^[a-z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }

  // Reserved usernames
  const reserved = ['admin', 'root', 'system', 'anonymous', 'guest', 'null', 'undefined']
  if (reserved.includes(trimmed)) {
    return { valid: false, error: 'This username is reserved' }
  }

  return { valid: true, sanitized: trimmed }
}

/**
 * Password validation
 * - 8-72 characters
 * - No obvious injection patterns
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, error: 'Password is required' }
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }

  if (password.length > 72) {
    return { valid: false, error: 'Password must be no more than 72 characters' }
  }

  // Check for SQL injection patterns (basic)
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\/\*|\*\/|;)/,
  ]

  for (const pattern of dangerousPatterns) {
    if (pattern.test(password)) {
      return { valid: false, error: 'Password contains invalid characters' }
    }
  }

  return { valid: true, sanitized: password }
}

/**
 * 6-digit PIN validation
 */
export function validatePin(pin: string): ValidationResult {
  const trimmed = pin.trim()

  if (!trimmed) {
    return { valid: false, error: 'PIN is required' }
  }

  if (!/^\d{6}$/.test(trimmed)) {
    return { valid: false, error: 'PIN must be exactly 6 digits' }
  }

  // Warn about weak PINs (all same digit, sequential)
  if (/^(.)\1{5}$/.test(trimmed)) {
    return { valid: false, error: 'PIN is too weak (all same digits)' }
  }

  if (trimmed === '123456' || trimmed === '654321') {
    return { valid: false, error: 'PIN is too weak (sequential digits)' }
  }

  return { valid: true, sanitized: trimmed }
}

/**
 * Name validation (full name, customer name, etc.)
 * - 1-100 characters
 * - Letters, spaces, hyphens, apostrophes
 * - No numbers or special characters (except - ')
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  const trimmed = name.trim()

  if (!trimmed) {
    return { valid: false, error: `${fieldName} is required` }
  }

  if (trimmed.length > 100) {
    return { valid: false, error: `${fieldName} must be no more than 100 characters` }
  }

  // Allow letters, spaces, hyphens, apostrophes, and basic international characters
  if (!/^[a-zA-Z\u00C0-\u017F\s'-]+$/.test(trimmed)) {
    return { valid: false, error: `${fieldName} contains invalid characters` }
  }

  // Sanitize: remove multiple spaces, trim
  const sanitized = trimmed.replace(/\s+/g, ' ').trim()

  return { valid: true, sanitized }
}

/**
 * Phone number validation
 * - 10-15 digits
 * - Optional formatting (+, -, spaces, parentheses)
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { valid: true, sanitized: '' } // Phone is optional
  }

  const trimmed = phone.trim()

  // Extract only digits
  const digits = trimmed.replace(/\D/g, '')

  if (digits.length < 10) {
    return { valid: false, error: 'Phone number must be at least 10 digits' }
  }

  if (digits.length > 15) {
    return { valid: false, error: 'Phone number must be no more than 15 digits' }
  }

  return { valid: true, sanitized: digits }
}

/**
 * Email validation
 * - Basic RFC 5322 compliance
 * - Max 254 characters
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim().toLowerCase()

  if (!trimmed) {
    return { valid: false, error: 'Email is required' }
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'Email is too long' }
  }

  // Basic email regex (not perfect but good enough)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' }
  }

  // Check for dangerous characters
  if (/[<>()[\]\\,;:\s@"]/.test(trimmed.split('@')[0])) {
    return { valid: false, error: 'Email contains invalid characters' }
  }

  return { valid: true, sanitized: trimmed }
}

/**
 * Text field validation (generic)
 * - Max length
 * - Sanitize HTML/script tags
 */
export function validateText(
  text: string,
  maxLength: number = 500,
  fieldName: string = 'Text'
): ValidationResult {
  if (!text) {
    return { valid: true, sanitized: '' } // Empty is ok for optional fields
  }

  const trimmed = text.trim()

  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} must be no more than ${maxLength} characters` }
  }

  // Sanitize: remove HTML tags and dangerous characters
  const sanitized = trimmed
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove remaining < >
    .trim()

  return { valid: true, sanitized }
}

/**
 * Number validation (prices, quantities, etc.)
 */
export function validateNumber(
  value: string | number,
  min: number = 0,
  max: number = 1000000,
  fieldName: string = 'Value'
): ValidationResult {
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` }
  }

  if (num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` }
  }

  if (num > max) {
    return { valid: false, error: `${fieldName} must be no more than ${max}` }
  }

  return { valid: true, sanitized: num.toString() }
}

/**
 * Sanitize HTML (remove all tags)
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Sanitize for database (escape single quotes)
 */
export function sanitizeForDb(text: string): string {
  return text.replace(/'/g, "''") // Escape single quotes (PostgreSQL)
}

/**
 * Validate table code (for table management)
 */
export function validateTableCode(code: string): ValidationResult {
  const trimmed = code.trim().toUpperCase()

  if (!trimmed) {
    return { valid: false, error: 'Table code is required' }
  }

  if (trimmed.length > 10) {
    return { valid: false, error: 'Table code must be no more than 10 characters' }
  }

  if (!/^[A-Z0-9-]+$/.test(trimmed)) {
    return { valid: false, error: 'Table code can only contain letters, numbers, and hyphens' }
  }

  return { valid: true, sanitized: trimmed }
}

/**
 * Validate UUID
 */
export function validateUuid(uuid: string): ValidationResult {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: 'Invalid ID format' }
  }

  return { valid: true, sanitized: uuid.toLowerCase() }
}

/**
 * Batch validation - validate multiple fields
 */
export function validateFields(
  fields: Record<string, { value: string; validator: (val: string) => ValidationResult }>
): { valid: boolean; errors: Record<string, string>; sanitized: Record<string, string> } {
  const errors: Record<string, string> = {}
  const sanitized: Record<string, string> = {}
  let allValid = true

  for (const [key, { value, validator }] of Object.entries(fields)) {
    const result = validator(value)
    if (!result.valid) {
      errors[key] = result.error || 'Invalid value'
      allValid = false
    } else {
      sanitized[key] = result.sanitized || value
    }
  }

  return { valid: allValid, errors, sanitized }
}
