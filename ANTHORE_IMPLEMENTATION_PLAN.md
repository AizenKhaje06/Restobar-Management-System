# ANTHORE RESTAURANT LANDING PAGE - EXACT IMPLEMENTATION PLAN

## CURRENT STATUS:
- ✅ Hero updated to "Taste the Extraordinary"
- ✅ Features updated (Fresh Ingredients, Expert Chefs, Cozy Ambiance, Great Service)
- ⏳ Need to replace Venues/Packages with Menu items

## EXACT SECTIONS TO IMPLEMENT:

### 1. HERO SECTION ✅
```
Tagline: "GOOD FOOD • GREAT VIBES"
Heading: "Taste the Extraordinary"
Subheading: Restaurant description with dining experience
CTA: "Book A Table" + "Watch Video"
Trust badges: Fresh ingredients, Award-winning chefs, Cozy atmosphere
```

### 2. FEATURES ICONS ✅
```
4 Icons in a row:
- Fresh Ingredients (Farm-to-table, always fresh)
- Expert Chefs (World-class culinary team)
- Cozy Ambiance (Perfect for every occasion)
- Great Service (Five-star hospitality, every visit)
```

### 3. SIGNATURE DISHES - 2x2 GRID 🔄
```
Section Title: "OUR MENU" or "Discover Our Signature Dishes"
Description: Signature dishes and flavors showcasing culinary artistry

Grid Layout: 2x2 (4 items)
Categories:
- Appetizers (image + label)
- Main Course (image + label)
- Burgers (image + label)
- Desserts (image + label)

Design:
- Dark cards with food images
- Category label overlay at bottom
- Hover effect with lighter background
- "View Full Menu" button at bottom
```

### 4. OUR STORY SECTION 🆕
```
Layout: Left (Image/Video) | Right (Text + Stats)

Left Side:
- Restaurant ambiance photo or video
- Play button overlay
- Text: "Good Food Brings People Together"

Right Side:
Title: "Our Story"
Text: "Anthore Restaurant was born from a simple idea -
to serve mouthwatering food in a welcoming
atmosphere. For years, we've been committed to
using only premium ingredients and supporting local farmers."

Stats (3 columns):
- 8+ Years of Experience
- 50+ Signature Menus
- 100K+ Happy Customers

Button: "Read Blog" or "Learn More"
```

### 5. GALLERY SECTION 🔄
```
Section Title: "OUR GALLERY" + "Moments of Good Food"
Subtitle: "A glimpse of the delicious moments at Anthore"

Layout: 4 images in a row
- Food plating shots
- Dining atmosphere
- Chef in action
- Happy customers

Carousel with dots navigation
```

### 6. POPULAR ITEMS CAROUSEL 🆕
```
Section Title: "POPULAR" + "Our Most Popular Meals"
Subtitle: "Handpicked favorites loved by our guests"

Horizontal scroll carousel:
- 4 items visible
- Food image (square cards)
- Item name
- Price (₱XXX)
- Arrow navigation left/right
```

### 7. PASSION IN EVERY PLATE 🆕
```
Full-width dark hero section

Left Side (Text):
Title: "MEET OUR CHEF"
Heading: "Passion in Every Plate"
Description: "Our chefs bring years of experience and
dedication to each dish, using fresh, high-quality
ingredients to create memorable and delicious meals."
Button: "Meet the Chef"

Right Side:
- Chef plating food (action shot)
- Circular badge: "Crafted with Passion"
```

### 8. MORE THAN JUST A MEAL 🆕
```
Section Title: "WHY CHOOSE US"
Heading: "More Than Just a Meal"
Subtitle: "We offer a complete dining experience, from exceptional food
to warm, inviting atmosphere"

4 Icons:
- Premium Quality (Only the freshest ingredients)
- Creative Menu (Unique & inspired dishes)
- Lovely Atmosphere (Perfect for any occasion)
- Friendly Staff (Always here to serve)
```

### 9. TESTIMONIALS ✅
```
Section Title: "TESTIMONIALS"
Heading: "What Our Guests Say"
Subtitle: "Real experiences. Real people. Real love."

3 testimonial cards:
- Customer photo (circular)
- Name
- Star rating
- Quote text

Arrow navigation left/right
```

### 10. BOOK YOUR TABLE FORM 🆕
```
Right side sticky/prominent section

Background: Restaurant ambiance photo
Form fields:
- Name
- Time
- Phone
- Service Time (dropdown)
- Guests (number)

Button: "Reserve Now" (gold/amber)
```

### 11. FINAL CTA ✅
```
Full-width with food image background
Dark overlay

Heading: "Ready for a Delicious Experience?"
Subheading: "Book your table now and enjoy a memorable meal
at Anthore Restaurant"

Button: "Book A Table" (gold/amber)
```

### 12. FOOTER 🔄
```
4 columns:
1. Logo + Description + Social Icons
2. Quick Links (Home, Menu, About, Gallery, Contact)
3. Our Menu (Main Course, Appetizers, Desserts, Drinks)
4. Contact Us (Phone, Email, Address, Hours)

Copyright: "© 2025 Lumière Restaurant. All rights reserved."
```

---

## NEXT STEPS:

1. Replace Venues section with Menu Categories
2. Replace Packages grid with Signature Dishes 2x2
3. Create "Our Story" section with video + stats
4. Create "Popular Items" carousel
5. Create "Passion in Every Plate" hero
6. Create "More Than Just a Meal" icons
7. Update gallery to food photos
8. Create "Book Your Table" form
9. Update footer to restaurant format

## FILES TO MODIFY:
- `app/events/page.tsx` - Main restructure
- `components/events/features-section.tsx` - ✅ Done
- Create: `components/events/signature-dishes.tsx`
- Create: `components/events/our-story.tsx`
- Create: `components/events/popular-items.tsx`
- Create: `components/events/chef-section.tsx`
- Create: `components/events/booking-form.tsx`
- Update: `components/events/testimonials-section.tsx`
- Update: Footer component
