"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Save, 
  ArrowLeft,
  Plus,
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Leaf,
  ListChecks,
  Search,
} from "lucide-react"
import { getMenuPackageById, updateMenuPackage, getAllAvailableMenuItems } from "@/app/actions/admin-events"
import { uploadImage } from "@/lib/utils/upload"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface MenuItem {
  name: string
  description: string
  is_signature: boolean
}

export default function EditMenuPackagePage() {
  const router = useRouter()
  const params = useParams()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [availableMenuItems, setAvailableMenuItems] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [menuPackage, setMenuPackage] = useState({
    name: "",
    category: "buffet",
    description: "",
    price_per_person: 500,
    min_order: 50,
    items: [] as MenuItem[],
    dietary_info: {
      vegetarian: false,
      vegan: false,
      halal: false,
      gluten_free: false,
    },
    photo: "",
    is_active: true,
  })

  const [newItem, setNewItem] = useState<MenuItem>({
    name: "",
    description: "",
    is_signature: false,
  })

  // Fetch existing menu package data
  useEffect(() => {
    const loadMenuPackage = async () => {
      const id = params.id as string
      const { menuPackage: data, error } = await getMenuPackageById(id)
      
      if (error || !data) {
        toast.error(error || "Menu package not found")
        router.push("/admin/events/menu")
        return
      }

      setMenuPackage({
        name: data.name,
        category: data.category,
        description: data.description || "",
        price_per_person: data.price_per_person,
        min_order: data.min_order,
        items: data.items || [],
        dietary_info: data.dietary_info || {
          vegetarian: false,
          vegan: false,
          halal: false,
          gluten_free: false,
        },
        photo: data.photo || "",
        is_active: data.is_active,
      })

      setLoading(false)
    }

    loadMenuPackage()
  }, [params.id, router])

  // Load available menu items when modal opens
  useEffect(() => {
    const loadMenuItems = async () => {
      if (showMenuModal && availableMenuItems.length === 0) {
        const { menuItems, error } = await getAllAvailableMenuItems()
        if (!error && menuItems) {
          setAvailableMenuItems(menuItems)
        }
      }
    }
    loadMenuItems()
  }, [showMenuModal])

  const handleSave = async () => {
    if (!menuPackage.name || !menuPackage.category) {
      toast.error("Please fill in all required fields")
      return
    }

    if (menuPackage.items.length === 0) {
      toast.error("Please add at least one menu item")
      return
    }

    setSaving(true)
    
    const id = params.id as string
    const { error } = await updateMenuPackage(id, menuPackage)
    
    if (error) {
      toast.error(error)
      setSaving(false)
    } else {
      toast.success("Menu package updated successfully!")
      router.push("/admin/events/menu")
    }
  }

  const addItem = () => {
    if (newItem.name.trim()) {
      setMenuPackage({
        ...menuPackage,
        items: [...menuPackage.items, newItem]
      })
      setNewItem({ name: "", description: "", is_signature: false })
    } else {
      toast.error("Please enter a menu item name")
    }
  }

  const addItemFromMenu = (menuItem: any) => {
    // Check if item already exists
    const exists = menuPackage.items.some(item => item.name === menuItem.name)
    if (exists) {
      toast.error("This item is already in the package")
      return
    }

    setMenuPackage({
      ...menuPackage,
      items: [...menuPackage.items, {
        name: menuItem.name,
        description: menuItem.description || "",
        is_signature: false
      }]
    })
    toast.success(`Added ${menuItem.name}`)
  }

  const removeItem = (index: number) => {
    setMenuPackage({
      ...menuPackage,
      items: menuPackage.items.filter((_, i) => i !== index)
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingPhoto(true)
    const file = files[0]

    try {
      const { url, error } = await uploadImage(file, 'event-images', 'menu')
      
      if (error) {
        toast.error(error)
      } else if (url) {
        setMenuPackage({...menuPackage, photo: url})
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
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
          <h1 className="text-3xl font-bold">Edit Menu Package</h1>
          <p className="text-muted-foreground">Update menu package details</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold">Basic Information</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Package Name * <span className="text-red-500">Required</span>
            </label>
            <Input
              value={menuPackage.name}
              onChange={(e) => setMenuPackage({...menuPackage, name: e.target.value})}
              placeholder="e.g., Classic Filipino Buffet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Category * <span className="text-red-500">Required</span>
            </label>
            <Select
              value={menuPackage.category}
              onValueChange={(value) => value && setMenuPackage({...menuPackage, category: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buffet">Buffet</SelectItem>
                <SelectItem value="plated">Plated Meal</SelectItem>
                <SelectItem value="drinks">Drinks Package</SelectItem>
                <SelectItem value="dessert">Dessert Package</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={menuPackage.description}
            onChange={(e) => setMenuPackage({...menuPackage, description: e.target.value})}
            placeholder="Describe this menu package..."
            rows={3}
          />
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg border">
          <Checkbox
            checked={menuPackage.is_active}
            onCheckedChange={(checked) => setMenuPackage({...menuPackage, is_active: checked as boolean})}
          />
          <label className="text-sm cursor-pointer">
            Active (visible to customers)
          </label>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold">Pricing & Requirements</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Package Price (₱) *</label>
            <Input
              type="number"
              value={menuPackage.price_per_person}
              onChange={(e) => setMenuPackage({...menuPackage, price_per_person: Number(e.target.value)})}
              min="0"
              step="50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Current: ₱{menuPackage.price_per_person.toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Minimum Order (pax) *</label>
            <Input
              type="number"
              value={menuPackage.min_order}
              onChange={(e) => setMenuPackage({...menuPackage, min_order: Number(e.target.value)})}
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Menu Items</h2>
          
          {/* Choose from Menu Button */}
          <Dialog open={showMenuModal} onOpenChange={setShowMenuModal}>
            <DialogTrigger
              render={
                <Button variant="outline" type="button" />
              }
            >
              <ListChecks className="size-4 mr-2" />
              Choose from Menu
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Choose Menu Items</DialogTitle>
                <DialogDescription>
                  Select items from your restaurant menu to add to this package
                </DialogDescription>
              </DialogHeader>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All Items
                </Button>
                {Array.from(new Set(availableMenuItems.map(item => item.category?.name).filter(Boolean))).map((categoryName) => (
                  <Button
                    key={categoryName}
                    type="button"
                    variant={selectedCategory === categoryName ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(categoryName as string)}
                  >
                    {categoryName}
                  </Button>
                ))}
              </div>

              {/* Menu Items Grid */}
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableMenuItems
                    .filter(item => {
                      // Filter by category
                      if (selectedCategory !== "all" && item.category?.name !== selectedCategory) {
                        return false
                      }
                      // Filter by search query
                      if (searchQuery && !(
                        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
                      )) {
                        return false
                      }
                      return true
                    })
                    .map((item) => {
                      const alreadyAdded = menuPackage.items.some(i => i.name === item.name)
                      return (
                        <div
                          key={item.id}
                          className={`border rounded-lg overflow-hidden hover:shadow-md transition-all ${
                            alreadyAdded ? 'opacity-50' : ''
                          }`}
                        >
                          {/* Image */}
                          {item.image_url ? (
                            <div className="h-32 overflow-hidden bg-muted">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-32 bg-muted flex items-center justify-center">
                              <ImageIcon className="size-12 text-muted-foreground/30" />
                            </div>
                          )}

                          {/* Info */}
                          <div className="p-3 space-y-2">
                            <div>
                              <h4 className="font-semibold">{item.name}</h4>
                              {item.category && (
                                <p className="text-xs text-muted-foreground">{item.category.name}</p>
                              )}
                              {item.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-amber-600">
                                ₱{Number(item.price).toLocaleString()}
                              </span>
                              <Button
                                size="sm"
                                onClick={() => addItemFromMenu(item)}
                                disabled={alreadyAdded}
                              >
                                {alreadyAdded ? 'Added' : 'Add'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>

                {availableMenuItems.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="size-16 mx-auto mb-4 text-muted-foreground/30" />
                    <p>No menu items available</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Add Item Form */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">Or add custom items manually:</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              placeholder="Item name (e.g., Grilled Chicken)"
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            <Input
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              placeholder="Description (optional)"
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={newItem.is_signature}
                onCheckedChange={(checked) => setNewItem({...newItem, is_signature: checked as boolean})}
              />
              <label className="text-sm">Mark as signature dish</label>
            </div>
            <Button onClick={addItem} type="button">
              <Plus className="size-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Items List */}
        {menuPackage.items.length > 0 ? (
          <div className="space-y-2">
            {menuPackage.items.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{item.name}</span>
                    {item.is_signature && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                        Signature
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <button
                  onClick={() => removeItem(index)}
                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No menu items added yet. Add your first item above.</p>
          </div>
        )}
      </div>

      {/* Dietary Information */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Leaf className="size-5 text-green-600" />
          Dietary Information
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(menuPackage.dietary_info).map(([key, value]) => (
            <div key={key} className="flex items-center gap-3 p-3 rounded-lg border">
              <Checkbox
                checked={value}
                onCheckedChange={(checked) => 
                  setMenuPackage({
                    ...menuPackage,
                    dietary_info: {...menuPackage.dietary_info, [key]: checked as boolean}
                  })
                }
              />
              <label className="text-sm capitalize cursor-pointer">
                {key.replace('_', ' ')}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Photo */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold">Package Photo</h2>

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

        {menuPackage.photo && (
          <div className="relative group rounded-lg overflow-hidden border max-w-sm">
            <img
              src={menuPackage.photo}
              alt="Package preview"
              className="w-full h-48 object-cover"
            />
            <button
              onClick={() => setMenuPackage({...menuPackage, photo: ""})}
              className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="size-4" />
            </button>
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
          disabled={saving || !menuPackage.name || !menuPackage.category || menuPackage.items.length === 0}
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
