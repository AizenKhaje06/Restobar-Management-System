"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Save, 
  ArrowLeft,
  Plus,
  X,
  Trash2,
  Upload,
  Image as ImageIcon,
  Loader2
} from "lucide-react"
import { createVenue } from "@/app/actions/admin-events"
import { uploadImage, deleteImage } from "@/lib/utils/upload"
import { toast } from "sonner"

export default function NewVenuePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [venue, setVenue] = useState({
    name: "",
    location: "",
    description: "",
    capacity_min: 50,
    capacity_max: 200,
    base_rate: 50000,
    photos: [] as string[],
    amenities: [] as string[],
    is_active: true,
  })

  const [newAmenity, setNewAmenity] = useState("")

  const handleSave = async () => {
    if (!venue.name || !venue.location) {
      toast.error("Please fill in all required fields")
      return
    }

    setSaving(true)
    
    const { error } = await createVenue(venue)
    
    if (error) {
      toast.error(error)
      setSaving(false)
    } else {
      toast.success("Venue created successfully!")
      router.push("/admin/events/venues")
    }
  }

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setVenue({...venue, amenities: [...venue.amenities, newAmenity.trim()]})
      setNewAmenity("")
    }
  }

  const removeAmenity = (index: number) => {
    setVenue({
      ...venue,
      amenities: venue.amenities.filter((_, i) => i !== index)
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if already at max limit (5 photos)
    if (venue.photos.length >= 5) {
      toast.error("Maximum 5 photos allowed per venue")
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setUploadingPhoto(true)
    const file = files[0]

    try {
      const { url, error } = await uploadImage(file, 'event-images', 'venues')
      
      if (error) {
        toast.error(error)
      } else if (url) {
        setVenue({...venue, photos: [...venue.photos, url]})
        toast.success("Photo uploaded successfully!")
      }
    } catch (error) {
      toast.error("Failed to upload photo")
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removePhoto = async (index: number) => {
    const photoUrl = venue.photos[index]
    
    // Remove from state first
    setVenue({
      ...venue,
      photos: venue.photos.filter((_, i) => i !== index)
    })

    // Try to delete from storage
    try {
      await deleteImage(photoUrl, 'event-images')
      toast.success("Photo removed")
    } catch (error) {
      console.log("Could not delete image from storage:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button - Left aligned */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-4 mr-2" />
        Back
      </Button>

      {/* Content - Centered */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Add New Venue</h1>
          <p className="text-muted-foreground">Create a new event venue</p>
        </div>

      {/* Basic Information */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium mb-2">
            Venue Name * <span className="text-red-500">Required</span>
          </label>
          <Input
            value={venue.name}
            onChange={(e) => setVenue({...venue, name: e.target.value})}
            placeholder="e.g., Grand Ballroom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Location * <span className="text-red-500">Required</span>
          </label>
          <Input
            value={venue.location}
            onChange={(e) => setVenue({...venue, location: e.target.value})}
            placeholder="e.g., 2nd Floor, Main Building"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={venue.description}
            onChange={(e) => setVenue({...venue, description: e.target.value})}
            placeholder="Describe the venue, its features, and what makes it special..."
            rows={4}
          />
        </div>
      </div>

      {/* Capacity & Pricing */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold">Capacity & Pricing</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Capacity *</label>
            <Input
              type="number"
              value={venue.capacity_min}
              onChange={(e) => setVenue({...venue, capacity_min: Number(e.target.value)})}
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Maximum Capacity *</label>
            <Input
              type="number"
              value={venue.capacity_max}
              onChange={(e) => setVenue({...venue, capacity_max: Number(e.target.value)})}
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Base Rate (₱) *</label>
          <Input
            type="number"
            value={venue.base_rate}
            onChange={(e) => setVenue({...venue, base_rate: Number(e.target.value)})}
            min="0"
            step="1000"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Current: ₱{venue.base_rate.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Photos */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Photos</h2>
          <span className="text-sm text-muted-foreground">
            {venue.photos.length} / 5 photos
          </span>
        </div>
        <p className="text-sm text-muted-foreground">Upload photos to showcase your venue</p>

        <div className="space-y-4">
          {/* Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploadingPhoto || venue.photos.length >= 5}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto || venue.photos.length >= 5}
              type="button"
              variant="outline"
              className="w-full"
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : venue.photos.length >= 5 ? (
                <>
                  <ImageIcon className="size-4 mr-2" />
                  Maximum 5 Photos Reached
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Upload Photo ({venue.photos.length}/5)
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: JPG, PNG, WebP (Max 5MB, up to 5 photos)
            </p>
          </div>

          {/* Photo Grid */}
          {venue.photos.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {venue.photos.map((photo, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border">
                  <img
                    src={photo}
                    alt={`Venue photo ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removePhoto(index)}
                      className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      type="button"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/70 text-white text-xs">
                    Photo {index + 1}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="size-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No photos uploaded yet</p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                type="button"
                variant="outline"
                size="sm"
              >
                <Upload className="size-4 mr-2" />
                Upload First Photo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Amenities */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold">Amenities</h2>
        <p className="text-sm text-muted-foreground">List all amenities and features</p>

        <div className="flex gap-2">
          <Input
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            placeholder="e.g., Air Conditioning, Stage, Audio System"
            onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
          />
          <Button onClick={addAmenity} type="button">
            <Plus className="size-4 mr-2" />
            Add
          </Button>
        </div>

        {venue.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {venue.amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted"
              >
                <span className="text-sm">{amenity}</span>
                <button
                  onClick={() => removeAmenity(index)}
                  className="hover:text-red-500"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !venue.name || !venue.location}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          {saving ? (
            <>Creating...</>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Create Venue
            </>
          )}
        </Button>
      </div>
    </div>
    </div>
  )
}
