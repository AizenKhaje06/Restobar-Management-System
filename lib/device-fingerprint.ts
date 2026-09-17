/**
 * Generate a unique device fingerprint for mobile security
 * This helps prevent customers from scanning multiple tables with the same device
 * 
 * The fingerprint is based on browser/device characteristics and stored in localStorage
 */

export function getDeviceFingerprint(): string {
  // Check if we already have a fingerprint in localStorage
  if (typeof window === "undefined") return ""
  
  const stored = localStorage.getItem("device_fp")
  if (stored) return stored

  // Generate new fingerprint based on device characteristics
  const components: string[] = []

  // Screen resolution
  components.push(`${screen.width}x${screen.height}`)
  components.push(`${screen.colorDepth}`)

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // Language
  components.push(navigator.language)

  // Platform
  components.push(navigator.platform)

  // User agent (partial, to avoid full tracking)
  const ua = navigator.userAgent
  const uaShort = ua.substring(0, 50) // First 50 chars only
  components.push(uaShort)

  // Hardware concurrency (CPU cores)
  if (navigator.hardwareConcurrency) {
    components.push(`cpu${navigator.hardwareConcurrency}`)
  }

  // Device memory (if available)
  if ('deviceMemory' in navigator) {
    components.push(`mem${(navigator as any).deviceMemory}`)
  }

  // Combine all components and create a hash
  const fingerprint = hashString(components.join("|"))

  // Store for future use
  localStorage.setItem("device_fp", fingerprint)

  return fingerprint
}

/**
 * Simple hash function to create a unique ID from the device components
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Convert to positive hex string
  return Math.abs(hash).toString(36).padStart(8, "0")
}

/**
 * Clear the device fingerprint (useful for testing or when user explicitly logs out all sessions)
 */
export function clearDeviceFingerprint(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("device_fp")
  }
}

/**
 * Check if the current device has an active session
 * This should be called before allowing the user to scan a new QR code
 */
export function hasStoredDeviceFingerprint(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("device_fp") !== null
}
