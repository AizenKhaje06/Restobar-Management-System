# Image Upload Implementation - Quick Status

## ✅ What's Done:

### Files Created:
1. ✅ `lib/utils/upload.ts` - Complete upload utility
2. ✅ `components/ui/image-upload.tsx` - Reusable components
3. ✅ `supabase/setup_storage_buckets.sql` - Storage setup
4. ✅ `app/admin/events/packages/new/page.tsx` - UPDATED with file upload

### Features:
- ✅ Drag & drop file upload
- ✅ Click to browse files
- ✅ Image preview
- ✅ File validation (type, size)
- ✅ Progress indicators
- ✅ Toast notifications
- ✅ Remove uploaded images
- ✅ Multiple image support

---

## 🎨 NEW Upload UI:

### Featured Image:
```
┌────────────────────────────────┐
│   📸  Drop image or click      │
│   PNG, JPG, GIF up to 5MB      │
└────────────────────────────────┘
```

### After Upload:
```
┌────────────────────────────────┐
│  [Image Preview]               │
│  [Remove Button on Hover]      │
└────────────────────────────────┘
```

### Gallery (Multiple):
```
┌────────────────────────────────┐
│   📤  Drop images or click     │
│   0/10 images uploaded         │
└────────────────────────────────┘

[Image 1] [Image 2] [Image 3]
[Image 4] [Image 5] [Image 6]
```

---

## ⏳ Still Need to Update (5 Pages):

### 1. Package Edit Page
**File:** `app/admin/events/packages/[id]/edit/page.tsx`
**Changes:** Same as new page - replace URL inputs with upload components

### 2. Venue New Page
**File:** `app/admin/events/venues/new/page.tsx`
**Changes:** Replace photo URL inputs with MultiImageUpload

### 3. Venue Edit Page
**File:** `app/admin/events/venues/[id]/edit/page.tsx`
**Changes:** Replace photo URL inputs with MultiImageUpload

### 4. Gallery Manager
**File:** `app/admin/events/gallery/page.tsx`
**Changes:** Replace URL input with ImageUpload component

### 5. Content Editor (Optional)
**File:** `app/admin/events/content/page.tsx`
**Changes:** Add image upload for testimonial images

---

## 🚀 To Complete Implementation:

### Step 1: Import Components
Add to all remaining pages:
```typescript
import { ImageUpload, MultiImageUpload } from "@/components/ui/image-upload"
```

### Step 2: Replace URL Inputs

**For Single Image:**
```typescript
// OLD:
<Input
  value={photo}
  onChange={(e) => setPhoto(e.target.value)}
  placeholder="Enter image URL"
/>

// NEW:
<ImageUpload
  value={photo}
  onChange={setPhoto}
  bucket="event-images"
  folder="packages"
/>
```

**For Multiple Images:**
```typescript
// OLD:
<Input value={newPhoto} onChange={(e) => setNewPhoto(e.target.value)} />
<Button onClick={addPhoto}>Add</Button>

// NEW:
<MultiImageUpload
  values={photos}
  onChange={setPhotos}
  bucket="event-images"
  folder="venues"
  maxFiles={10}
/>
```

### Step 3: Remove Old Functions
Delete these (no longer needed):
- `addPhoto()` / `addGalleryImage()`
- `removePhoto()` / `removeGalleryImage()`
- `newPhoto` / `newGalleryImage` state

### Step 4: Run Storage Setup
```sql
-- In Supabase SQL Editor:
-- Run supabase/setup_storage_buckets.sql
```

### Step 5: Test Everything
- Upload images
- Remove images
- Check Supabase Storage
- Verify public URLs work

---

## 💾 Storage Structure:

```
Supabase Storage
└── event-images/ (bucket)
    ├── packages/
    │   ├── 1234567890-abc123.jpg
    │   └── 1234567890-def456.png
    ├── venues/
    │   ├── 1234567890-ghi789.jpg
    │   └── 1234567890-jkl012.jpg
    └── gallery/
        ├── 1234567890-mno345.jpg
        └── 1234567890-pqr678.jpg
```

---

## ✨ Benefits:

### Before (URL):
- ❌ Users must host images elsewhere
- ❌ Copy/paste URLs manually
- ❌ Broken links possible
- ❌ No validation
- ❌ No preview

### After (Upload):
- ✅ Direct file upload
- ✅ Drag & drop support
- ✅ Instant preview
- ✅ File validation
- ✅ CDN delivery
- ✅ Centralized storage
- ✅ Professional UX

---

## 📋 Quick Copy-Paste Updates:

### For Package Edit:
Replace the "Images" section with:
```typescript
<div className="rounded-xl border bg-card p-6 space-y-4">
  <h2 className="text-xl font-bold">Images</h2>
  
  <div>
    <label className="block text-sm font-medium mb-2">Featured Image</label>
    <ImageUpload
      value={pkg.featured_image}
      onChange={(url) => setPkg({...pkg, featured_image: url})}
      bucket="event-images"
      folder="packages"
      disabled={saving}
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium mb-2">Gallery Images</label>
    <MultiImageUpload
      values={pkg.gallery}
      onChange={(urls) => setPkg({...pkg, gallery: urls})}
      bucket="event-images"
      folder="packages"
      maxFiles={10}
      disabled={saving}
    />
  </div>
</div>
```

### For Venue Pages:
```typescript
<div>
  <label className="block text-sm font-medium mb-2">Photos</label>
  <MultiImageUpload
    values={venue.photos}
    onChange={(urls) => setVenue({...venue, photos: urls})}
    bucket="event-images"
    folder="venues"
    maxFiles={15}
    disabled={saving}
  />
</div>
```

### For Gallery Manager:
```typescript
<ImageUpload
  value={newPhotoUrl}
  onChange={setNewPhotoUrl}
  bucket="event-images"
  folder="gallery"
  maxSize={10} // 10MB for gallery photos
/>
```

---

## 🎯 Current Progress:

**Pages:** 1/6 Updated (17%)  
**Components:** ✅ Complete  
**Utilities:** ✅ Complete  
**Storage:** ⏳ Pending setup  
**Testing:** ⏳ Pending  

---

## 🔥 Ready to Deploy:

Once all 6 pages are updated:
1. ✅ Run storage setup SQL
2. ✅ Test uploads
3. ✅ Verify storage
4. ✅ Check URLs
5. ✅ Deploy!

---

**Status:** 🚧 17% Complete  
**Next:** Update remaining 5 pages  
**ETA:** Quick updates, ~30 min work remaining

