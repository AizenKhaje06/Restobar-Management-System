"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Upload,
  Trash2,
  Image as ImageIcon,
  Search,
  Plus,
  X,
  Eye
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

type GalleryPhoto = {
  id: string
  url: string
  category: 'venue' | 'event' | 'all'
  title?: string
  sort_order: number
  created_at: string
}

export default function GalleryManagerPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'venue' | 'event'>('all')
  const [searchTerm, setSearchTerm] = useState("")
  
  // Add photo state
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPhotoUrl, setNewPhotoUrl] = useState("")
  const [newPhotoTitle, setNewPhotoTitle] = useState("")
  const [newPhotoCategory, setNewPhotoCategory] = useState<'venue' | 'event'>('venue')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("event_gallery")
      .select("*")
      .order("sort_order", { ascending: true })

    if (data) {
      setPhotos(data)
    }
    setLoading(false)
  }

  const handleAddPhoto = async () => {
    if (!newPhotoUrl.trim()) {
      toast.error("Please enter a photo URL")
      return
    }

    setUploading(true)
    const supabase = createClient()

    // Get max sort_order
    const maxSortOrder = photos.length > 0 
      ? Math.max(...photos.map(p => p.sort_order)) 
      : 0

    const { error } = await supabase
      .from("event_gallery")
      .insert({
        url: newPhotoUrl.trim(),
        title: newPhotoTitle.trim() || null,
        category: newPhotoCategory,
        sort_order: maxSortOrder + 1
      })

    if (error) {
      toast.error("Failed to add photo")
    } else {
      toast.success("Photo added successfully!")
      setNewPhotoUrl("")
      setNewPhotoTitle("")
      setShowAddForm(false)
      loadPhotos()
    }

    setUploading(false)
  }

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from("event_gallery")
      .delete()
      .eq("id", id)

    if (error) {
      toast.error("Failed to delete photo")
    } else {
      toast.success("Photo deleted successfully!")
      loadPhotos()
    }
  }

  const handleUpdateCategory = async (id: string, newCategory: 'venue' | 'event' | 'all') => {
    const supabase = createClient()
    const { error } = await supabase
      .from("event_gallery")
      .update({ category: newCategory })
      .eq("id", id)

    if (error) {
      toast.error("Failed to update photo")
    } else {
      toast.success("Photo category updated!")
      loadPhotos()
    }
  }

  // Filter photos
  const filteredPhotos = photos.filter(photo => {
    const matchesFilter = filter === 'all' || photo.category === filter || photo.category === 'all'
    const matchesSearch = !searchTerm || 
      photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.url.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block size-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage photos displayed on the public gallery page
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          {showAddForm ? (
            <>
              <X className="size-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="size-4 mr-2" />
              Add Photo
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Photos</p>
              <p className="text-3xl font-bold">{photos.length}</p>
            </div>
            <ImageIcon className="size-8 text-muted-foreground/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Venue Photos</p>
              <p className="text-3xl font-bold text-blue-600">
                {photos.filter(p => p.category === 'venue' || p.category === 'all').length}
              </p>
            </div>
            <ImageIcon className="size-8 text-blue-600/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Event Photos</p>
              <p className="text-3xl font-bold text-amber-600">
                {photos.filter(p => p.category === 'event' || p.category === 'all').length}
              </p>
            </div>
            <ImageIcon className="size-8 text-amber-600/30" />
          </div>
        </div>
      </div>

      {/* Add Photo Form */}
      {showAddForm && (
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-xl font-bold">Add New Photo</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Photo URL *</label>
            <Input
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title (Optional)</label>
            <Input
              value={newPhotoTitle}
              onChange={(e) => setNewPhotoTitle(e.target.value)}
              placeholder="e.g., Grand Ballroom Setup"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              value={newPhotoCategory}
              onChange={(e) => setNewPhotoCategory(e.target.value as 'venue' | 'event')}
              className="w-full px-3 py-2 rounded-lg border bg-background"
            >
              <option value="venue">Venue</option>
              <option value="event">Event</option>
            </select>
          </div>

          {newPhotoUrl && (
            <div>
              <label className="block text-sm font-medium mb-2">Preview</label>
              <div className="rounded-lg overflow-hidden border max-w-md">
                <img
                  src={newPhotoUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL'
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleAddPhoto}
              disabled={uploading || !newPhotoUrl.trim()}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Add Photo
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All ({photos.length})
          </Button>
          <Button
            variant={filter === 'venue' ? 'default' : 'outline'}
            onClick={() => setFilter('venue')}
            size="sm"
          >
            Venues ({photos.filter(p => p.category === 'venue' || p.category === 'all').length})
          </Button>
          <Button
            variant={filter === 'event' ? 'default' : 'outline'}
            onClick={() => setFilter('event')}
            size="sm"
          >
            Events ({photos.filter(p => p.category === 'event' || p.category === 'all').length})
          </Button>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search photos..."
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-muted/30">
          <ImageIcon className="size-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No photos found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm ? "Try a different search term" : "Add your first gallery photo"}
          </p>
          {!showAddForm && (
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              <Plus className="size-4 mr-2" />
              Add Photo
            </Button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Photo */}
              <div className="relative group">
                <img
                  src={photo.url}
                  alt={photo.title || 'Gallery photo'}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-white text-black hover:bg-gray-200"
                  >
                    <Eye className="size-5" />
                  </a>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                {photo.title && (
                  <h3 className="font-medium truncate">{photo.title}</h3>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Category:</span>
                  <select
                    value={photo.category}
                    onChange={(e) => handleUpdateCategory(photo.id, e.target.value as any)}
                    className="text-xs px-2 py-1 rounded-full border bg-background capitalize"
                  >
                    <option value="venue">Venue</option>
                    <option value="event">Event</option>
                    <option value="all">All</option>
                  </select>
                </div>

                <p className="text-xs text-muted-foreground">
                  Added: {new Date(photo.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Public Gallery Link */}
      <div className="text-center pt-6 border-t">
        <a
          href="/events/gallery"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          <Eye className="size-4" />
          View Public Gallery
        </a>
      </div>
    </div>
  )
}
