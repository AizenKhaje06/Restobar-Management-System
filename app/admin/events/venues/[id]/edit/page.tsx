"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Save, 
  ArrowLeft,
  Plus,
  X,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2
} from "lucide-react"
import { getVenueById, updateVenue } from "@/app/actions/admin-events"
import { uploadImage, deleteImage } from "@/lib/utils/upload"
import { toast } from "sonner"

export default function EditVenuePage() {
  const router = useRouter()
  const params = useParams()
  const venueId = params.id as string

  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    loadVenue()
  }, [venueId])

  const loadVenue = async () => {
    const { venue: data, error } = await getVenueById(venueId)
    if (data) {
      setVenue({
        name: data.name || "",
        location: data.location || "",
        description: data.description || "",
        capacity_min: data.capacity_min || 50,
        capacity_max: data.capacity_max || 200,
        base_rate: Number(data.base_rate) || 50000,
        photos: data.photos || [],
        amenities: data.amenities || [],
        is_active: data.is_active ?? true,
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    
    const { error } = await updateVenue(venueId, venue)
    
    if (error) {
      toast.error(error)
      setSaving(false)
    } else {
      toast.success("Venue updated successfully!")
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

    // Try to delete from storage (optional, may fail if not in storage)
    try {
      await deleteImage(photoUrl, 'event-images')
    } catch (error) {
      // Ignore deletion errors for externally hosted images
      console.log("Could not delete image from storage:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block size-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Loading venue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Edit Venue</h1>
          <p className="text-muted-foreground">Update venue information and settings</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium mb-2">Venue Name *</label>
          <Input
            value={venue.name}
            onChange={(e) => setVenue({...venue, name: e.target.value})}
            placeholder="e.g., Grand Ballroom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location *</label>
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
            placeholder="Describe the venue..."
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
        <h2 className="text-xl font-bold">Photos</h2>

        <div className="space-y-4">
          {/* Upload Button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploadingPhoto}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              type="button"
              variant="outline"
              className="w-full"
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Supported: JPG, PNG, WebP (Max 5MB)
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

        <div className="flex gap-2">
          <Input
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            placeholder="e.g., Air Conditioning"
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

      {/* Status */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold">Visibility</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Active Status</p>
            <p className="text-sm text-muted-foreground">
              {venue.is_active ? "Visible to customers" : "Hidden from customers"}
            </p>
          </div>
          <Button
            variant={venue.is_active ? "default" : "outline"}
            onClick={() => setVenue({...venue, is_active: !venue.is_active})}
          >
            {venue.is_active ? (
              <>
                <Eye className="size-4 mr-2" />
                Active
              </>
            ) : (
              <>
                <EyeOff className="size-4 mr-2" />
                Inactive
              </>
            )}
          </Button>
        </div>
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
            <>Saving...</>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
