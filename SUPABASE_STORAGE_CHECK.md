# Supabase Storage Configuration Check ✅

## Current Implementation

### Storage Buckets Used:
1. **`menu-images`** - For menu item photos
2. **`restaurant`** - For restaurant logo

### Upload Functions

#### Menu Images (`menu-images` bucket)
**Location:** `app/actions/admin.ts` → `uploadMenuImage()`

**Settings:**
- ✅ Max size: 5MB
- ✅ Allowed types: JPEG, PNG, WebP, GIF
- ✅ Path format: `menu/TIMESTAMP-RANDOM.ext`
- ✅ Content-Type: Preserved from file
- ✅ Cache-Control: 3600 seconds (1 hour)
- ✅ Upsert: false (no overwrite)

**Example path:** `menu/1736467890-abc123def.jpg`

#### Restaurant Logo (`restaurant` bucket)
**Location:** `app/actions/admin.ts` → `uploadLogo()`

**Settings:**
- ✅ Max size: 5MB
- ✅ Allowed types: JPEG, PNG, WebP, GIF
- ✅ Path format: `logo.TIMESTAMP.jpg`
- ✅ Content-Type: `image/jpeg` (forced)
- ✅ Upsert: true (overwrites old logos)

**Example path:** `logo.1736467890.jpg`

---

## Required Supabase Configuration

### Step 1: Create Storage Buckets

Sa Supabase Dashboard:
1. Go to **Storage** → **Create bucket**
2. Create 2 buckets:
   - Bucket name: `menu-images`
     - Public: ✅ Yes
   - Bucket name: `restaurant`
     - Public: ✅ Yes

### Step 2: Set Storage Policies

#### For `menu-images` bucket:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload menu images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');

-- Allow public read access
CREATE POLICY "Public can view menu images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete menu images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images');
```

#### For `restaurant` bucket:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload restaurant logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'restaurant');

-- Allow public read access
CREATE POLICY "Public can view restaurant logo"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'restaurant');

-- Allow authenticated users to update
CREATE POLICY "Authenticated users can update restaurant logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'restaurant');
```

### Step 3: Verify Environment Variables

Check your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

---

## Testing Upload Connection

### Test Menu Item Image Upload:
1. Go to `/admin/menu`
2. Click **"New Item"**
3. Fill in details
4. Upload an image (JPG, PNG, WebP, or GIF, max 5MB)
5. Click **Save**
6. ✅ Check: Image should appear in the item card
7. ✅ Check: URL should be: `https://YOUR-PROJECT.supabase.co/storage/v1/object/public/menu-images/menu/TIMESTAMP-HASH.ext`

### Test Restaurant Logo Upload:
1. Go to `/admin/settings`
2. Scroll to **"Restaurant Logo"**
3. Upload a logo image
4. Click **"Save Changes"**
5. ✅ Check: Logo should appear in settings preview
6. ✅ Check: Logo should appear in sidebar (top-left)
7. ✅ Check: URL should be: `https://YOUR-PROJECT.supabase.co/storage/v1/object/public/restaurant/logo.TIMESTAMP.jpg`

---

## Common Issues & Solutions

### ❌ Issue: "Upload failed: new row violates row-level security policy"
**Solution:** Storage policies not set. Run the SQL policies above.

### ❌ Issue: "Upload failed: Bucket not found"
**Solution:** Buckets don't exist. Create `menu-images` and `restaurant` buckets.

### ❌ Issue: Images upload but don't display
**Solution:** 
1. Check if buckets are set to **Public**
2. Check if SELECT policy allows `public` access
3. Verify `getPublicUrl()` returns correct URL

### ❌ Issue: "Image too large" error
**Solution:** 
- Current limit: 5MB
- Compress images before upload
- Or increase `MAX_IMAGE_BYTES` in `app/actions/admin.ts`

### ❌ Issue: Logo keeps old version after upload
**Solution:** 
- Browser cache issue
- Hard refresh: Ctrl+Shift+R
- Or clear browser cache

---

## Image Compression

Both upload functions support **client-side compression**:

**Menu items:** 
- Component: `components/admin/menu-manager.tsx`
- Function: `compressImage()` (800px max, 75% quality)

**Restaurant logo:**
- Component: `components/admin/settings-manager.tsx`
- Function: `compressImage()` (800px max, 75% quality)

Images are compressed in the browser BEFORE upload to save bandwidth and storage space.

---

## Verification Checklist

- [ ] Supabase project is created
- [ ] `.env.local` has correct SUPABASE_URL and ANON_KEY
- [ ] `menu-images` bucket exists and is public
- [ ] `restaurant` bucket exists and is public
- [ ] Storage policies are set for both buckets
- [ ] Test menu item image upload works
- [ ] Test restaurant logo upload works
- [ ] Images display correctly in UI
- [ ] Public URLs are accessible

---

## Storage URLs Structure

### Menu Images:
```
https://YOUR-PROJECT.supabase.co/storage/v1/object/public/menu-images/menu/1736467890-abc123.jpg
         └─ Project ID                                    └─ Bucket    └─ Path      └─ Filename
```

### Restaurant Logo:
```
https://YOUR-PROJECT.supabase.co/storage/v1/object/public/restaurant/logo.1736467890.jpg
         └─ Project ID                                    └─ Bucket   └─ Filename
```

---

## Code References

**Upload Functions:**
- `app/actions/admin.ts` lines 17-53 (menu images)
- `app/actions/admin.ts` lines 613-631 (logo)

**Client-side Compression:**
- `components/admin/menu-manager.tsx` lines 31-65
- `components/admin/settings-manager.tsx` lines 28-62

**Usage:**
- Menu: `components/admin/menu-manager.tsx`
- Settings: `components/admin/settings-manager.tsx`

---

**Status:** ✅ Code implementation is CORRECT
**Next Step:** Verify Supabase buckets and policies are configured properly
