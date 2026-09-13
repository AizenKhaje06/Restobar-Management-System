/**
 * Image Compression Utility
 * Compresses images client-side before upload to save storage space
 * while maintaining good visual quality
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0.0 to 1.0
  outputFormat?: 'image/jpeg' | 'image/webp' | 'image/png'
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85, // 85% quality - good balance between size and quality
  outputFormat: 'image/webp', // WebP for best compression
}

/**
 * Compress an image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<File> - Compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // Return original if not an image
  if (!file.type.startsWith('image/')) {
    return file
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img
          const maxWidth = opts.maxWidth!
          const maxHeight = opts.maxHeight!

          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height

            if (width > height) {
              width = maxWidth
              height = width / aspectRatio
            } else {
              height = maxHeight
              width = height * aspectRatio
            }
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Use better image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Draw image
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }

              // Create new file from blob
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, getExtension(opts.outputFormat!)),
                {
                  type: opts.outputFormat,
                  lastModified: Date.now(),
                }
              )

              // Log compression results
              const originalSize = (file.size / 1024).toFixed(2)
              const compressedSize = (compressedFile.size / 1024).toFixed(2)
              const savings = (
                ((file.size - compressedFile.size) / file.size) *
                100
              ).toFixed(1)

              console.log(
                `Image compressed: ${originalSize}KB → ${compressedSize}KB (${savings}% reduction)`
              )

              resolve(compressedFile)
            },
            opts.outputFormat,
            opts.quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Get file extension for output format
 */
function getExtension(format: string): string {
  switch (format) {
    case 'image/jpeg':
      return '.jpg'
    case 'image/webp':
      return '.webp'
    case 'image/png':
      return '.png'
    default:
      return '.jpg'
  }
}

/**
 * Compress multiple images
 */
export async function compressImages(
  files: File[],
  options?: CompressionOptions
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)))
}

/**
 * Get estimated compression savings
 */
export function estimateCompressionSavings(
  fileSize: number,
  quality: number = 0.85
): number {
  // Rough estimate: WebP at 85% quality typically achieves 50-70% size reduction
  const estimatedReduction = 0.6 // 60% average
  return Math.round(fileSize * estimatedReduction)
}
