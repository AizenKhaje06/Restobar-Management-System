import { createClient } from "@/lib/supabase/client"

export type UploadProgress = {
  progress: number
  status: 'idle' | 'uploading' | 'success' | 'error'
  error?: string
}

/**
 * Upload an image file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - Storage bucket name (default: 'event-images')
 * @param folder - Optional folder path within bucket
 * @returns Public URL of the uploaded file
 */
export async function uploadImage(
  file: File,
  bucket: string = 'event-images',
  folder?: string
): Promise<{ url?: string; error?: string }> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { error: 'Please select an image file' }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return { error: 'Image must be less than 5MB' }
    }

    const supabase = createClient()

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomStr}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { error: error.message || 'Failed to upload image' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { url: publicUrl }
  } catch (error) {
    console.error('Upload error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Delete an image from Supabase Storage
 * @param url - Public URL of the image
 * @param bucket - Storage bucket name
 */
export async function deleteImage(
  url: string,
  bucket: string = 'event-images'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Extract file path from URL
    const urlParts = url.split(`/storage/v1/object/public/${bucket}/`)
    if (urlParts.length < 2) {
      return { success: false, error: 'Invalid image URL' }
    }

    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete error:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}

/**
 * Upload multiple images
 * @param files - Array of files to upload
 * @param bucket - Storage bucket name
 * @param folder - Optional folder path
 * @param onProgress - Callback for upload progress
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: string = 'event-images',
  folder?: string,
  onProgress?: (progress: number) => void
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = []
  const errors: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const { url, error } = await uploadImage(file, bucket, folder)

    if (url) {
      urls.push(url)
    } else if (error) {
      errors.push(`${file.name}: ${error}`)
    }

    if (onProgress) {
      onProgress(((i + 1) / files.length) * 100)
    }
  }

  return { urls, errors }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      if (minWidth && img.width < minWidth) {
        resolve({ valid: false, error: `Image width must be at least ${minWidth}px` })
        return
      }

      if (minHeight && img.height < minHeight) {
        resolve({ valid: false, error: `Image height must be at least ${minHeight}px` })
        return
      }

      if (maxWidth && img.width > maxWidth) {
        resolve({ valid: false, error: `Image width must be at most ${maxWidth}px` })
        return
      }

      if (maxHeight && img.height > maxHeight) {
        resolve({ valid: false, error: `Image height must be at most ${maxHeight}px` })
        return
      }

      resolve({ valid: true })
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ valid: false, error: 'Failed to load image' })
    }

    img.src = objectUrl
  })
}
