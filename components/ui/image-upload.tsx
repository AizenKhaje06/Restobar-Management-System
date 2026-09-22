"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { uploadImage, formatFileSize } from "@/lib/utils/upload"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
  bucket?: string
  folder?: string
  maxSize?: number // in MB
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  bucket = 'event-images',
  folder,
  maxSize = 5,
  className
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    // Validate file size
    const maxBytes = maxSize * 1024 * 1024
    if (file.size > maxBytes) {
      toast.error(`Image must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setUploading(true)

    const { url, error } = await uploadImage(file, bucket, folder)

    if (error) {
      toast.error(error)
    } else if (url) {
      onChange(url)
      toast.success('Image uploaded successfully!')
    }

    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    if (disabled || uploading) return

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = () => {
    if (onRemove) {
      onRemove()
    } else {
      onChange('')
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {value ? (
        // Preview with remove button
        <div className="relative group rounded-lg overflow-hidden border">
          <img
            src={value}
            alt="Uploaded image"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={disabled || uploading}
            >
              <X className="size-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        // Upload area
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            dragOver && "border-amber-600 bg-amber-50 dark:bg-amber-950/20",
            disabled && "opacity-50 cursor-not-allowed",
            !disabled && "cursor-pointer hover:border-amber-600"
          )}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="size-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-sm font-medium">Uploading image...</p>
            </>
          ) : (
            <>
              <ImageIcon className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium mb-1">
                Drop an image here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to {maxSize}MB
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={disabled || uploading}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}

interface MultiImageUploadProps {
  values?: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
  bucket?: string
  folder?: string
  maxSize?: number
  maxFiles?: number
  className?: string
}

export function MultiImageUpload({
  values = [],
  onChange,
  disabled = false,
  bucket = 'event-images',
  folder,
  maxSize = 5,
  maxFiles = 10,
  className
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelect = async (files: FileList) => {
    if (values.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`)
      return
    }

    setUploading(true)
    const newUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file size
      const maxBytes = maxSize * 1024 * 1024
      if (file.size > maxBytes) {
        toast.error(`${file.name}: File too large (max ${maxSize}MB)`)
        continue
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: Not an image file`)
        continue
      }

      const { url, error } = await uploadImage(file, bucket, folder)

      if (error) {
        toast.error(`${file.name}: ${error}`)
      } else if (url) {
        newUrls.push(url)
      }
    }

    if (newUrls.length > 0) {
      onChange([...values, ...newUrls])
      toast.success(`${newUrls.length} image(s) uploaded successfully!`)
    }

    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    if (disabled || uploading) return

    handleFilesSelect(e.dataTransfer.files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelect(e.target.files)
    }
  }

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragOver && "border-amber-600 bg-amber-50 dark:bg-amber-950/20",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer hover:border-amber-600"
        )}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="size-10 text-muted-foreground mx-auto mb-3 animate-spin" />
            <p className="text-sm font-medium">Uploading images...</p>
          </>
        ) : (
          <>
            <Upload className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">
              Drop images here or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to {maxSize}MB · {values.length}/{maxFiles} images
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          disabled={disabled || uploading || values.length >= maxFiles}
          className="hidden"
        />
      </div>

      {/* Image Grid */}
      {values.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          {values.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <button
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
