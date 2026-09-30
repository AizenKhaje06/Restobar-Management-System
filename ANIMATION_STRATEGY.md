# Landing Page Animation Strategy

## Animation Plan Per Section

### 1. Hero Section
- **Animation:** Already has built-in animations
- **Keep existing:** Fade in, slide up effects
- **Status:** ✅ No changes needed

### 2. Features Section (4 icons)
- **Animation:** Stagger Fade Up
- **Why:** Cards appear one by one (150ms delay each)
- **Component:** Wrap each feature with `<StaggerItem>`

### 3. Media Features
- **Animation:** Fade Up
- **Why:** Simple, clean reveal for logos
- **Component:** `<FadeUp>` wrapper

### 4. Signature Dishes (5-card carousel)
- **Animation:** Scale + Fade for whole section
- **Why:** Dramatic reveal for featured menu
- **Component:** `<ScaleFade>` wrapper

### 5. Food Categories
- **Animation:** Stagger Fade Up
- **Why:** Category cards appear one by one
- **Component:** `<StaggerContainer>` + `<StaggerItem>`

### 6. Our Story Section
- **Animation:** Slide Left (text) + Slide Right (image)
- **Why:** Two-column layout with opposing directions
- **Component:** `<SlideLeft>` for text, `<SlideRight>` for image

### 7. Events Place Section
- **Animation:** Slide Right (image) + Slide Left (text)
- **Why:** Opposite of Our Story for visual variety
- **Component:** `<SlideRight>` for image, `<SlideLeft>` for text

### 8. Moments Gallery
- **Animation:** Fade Up (header) + Stagger (images)
- **Why:** Gallery images appear progressively
- **Component:** `<FadeUp>` + `<StaggerItem>`

### 9. Value Section (Why Choose Us)
- **Animation:** Stagger Fade Up
- **Why:** Value prop cards appear one by one
- **Component:** `<StaggerContainer>` + `<StaggerItem>`

### 10. Testimonials
- **Animation:** Scale + Fade
- **Why:** Highlight customer feedback
- **Component:** `<ScaleFade>`

### 11. Digital Partners
- **Animation:** Fade Up
- **Why:** Simple reveal for partner logos
- **Component:** `<FadeUp>`

### 12. FAQ Section
- **Animation:** Fade Up
- **Why:** Clean, simple reveal
- **Component:** `<FadeUp>`

### 13. Booking Form
- **Animation:** Scale + Fade
- **Why:** Draw attention to CTA
- **Component:** `<ScaleFade>`

### 14. Final CTA
- **Animation:** Fade Up
- **Why:** Simple, direct call-to-action
- **Component:** `<FadeUp>`

## Implementation Notes
- All animations trigger once when element enters viewport
- Threshold: 10% of element visible
- Duration: 600-700ms for smooth feel
- Stagger delay: 100-150ms between items
- No animation on mobile for performance (optional)
