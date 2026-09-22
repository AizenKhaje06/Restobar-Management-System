"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Save, 
  ArrowLeft,
  Plus,
  X,
  Trash2
} from "lucide-react"
import { createVenue } from "@/app/actions/admin-events"
import { toast } from "sonner"

export default function NewVenuePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
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
  const [newPhoto, setNewPhoto] = useState("")

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

  const addPhoto = () => {
    if (newPhoto.trim()) {
      setVenue({...venue, photos: [...venue.photos, newPhoto.trim()]})
      setNewPhoto("")
    }
  }

  const removePhoto = (index: number) => {
    setVenue({
      ...venue,
      photos: venue.photos.filter((_, i) => i !== index)
    })
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
          <h1 className="text-3xl font-bold">Add New Venue</h1>
          <p className="text-muted-foreground">Create a new event venue</p>
        </div>
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
        <h2 className="text-xl font-bold">Photos</h2>
        <p className="text-sm text-muted-foreground">Add photos to showcase your venue</p>

        <div className="flex gap-2">
          <Input
            value={newPhoto}
            onChange={(e) => setNewPhoto(e.target.value)}
            placeholder="Enter photo URL (e.g., https://...)"
            onKeyPress={(e) => e.key === 'Enter' && addPhoto()}
          />
          <Button onClick={addPhoto} type="button">
            <Plus className="size-4 mr-2" />
            Add
          </Button>
        </div>

        {venue.photos.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {venue.photos.map((photo, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden border">
                <img
                  src={photo}
                  alt={`Venue photo ${index + 1}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'%3EInvalid URL%3C/text%3E%3C/svg%3E"
                  }}
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
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
  )
}
