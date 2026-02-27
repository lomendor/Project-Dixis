# E-Commerce / Marketplace UI Competitive Analysis

**Date:** 2026-02-27
**Purpose:** Visual research across major e-commerce and marketplace platforms to inform the design direction for Dixis, a Greek artisan food e-commerce site.
**Platforms analyzed:** Skroutz.gr, Wolt.com, Instacart.com, Amazon Fresh, DoorDash.com, Etsy.com

---

## 1. Skroutz.gr -- Greece's Largest Marketplace

### Product Cards
- **Image shape:** Portrait-leaning rectangle in search results; square thumbnails in comparison tables
- **Aspect ratio:** Content-adaptive -- Skroutz uses a "Content-based adaptive Card UI" system where card width/height adjusts based on content density rather than a fixed ratio. In product listings, images tend toward ~4:5 or 1:1
- **Info shown:** Product title (descriptive, including brand + model + key specs), price range (lowest available), number of shops carrying the item, star rating (1-5), number of reviews, "favorite" heart icon
- **Price display:** Bold, large font (roughly 18-20px equivalent), dark text for standard price. Price is positioned below the title. Emphasis on "from X EUR" format since Skroutz is a price-comparison engine
- **Add-to-cart button:** No direct add-to-cart on listing cards. The primary CTA is "view offers" / compare prices. Add-to-cart only appears on the individual product page after selecting a merchant
- **Corner radius:** Moderate -- approximately 8-12px (their design system uses a stepped radius approach)
- **Shadow/border:** Subtle shadow on hover; light border (1px neutral gray) in default state
- **Padding:** Internal padding approximately 12-16px; tighter on mobile

### Layout & Grid
- **Products per row (desktop):** 4-5 columns in grid view; single-column list view also available
- **Grid type:** Contained within a max-width container (~1200px)
- **Gap between cards:** ~16-20px (they specify 20px gutters in their design system Sass mixins)
- **Sidebar:** Yes -- left sidebar with category filters, price sliders, brand checkboxes, rating filters. Sidebar takes roughly 240-280px

### Colors
- **Background:** White (#FFFFFF) for cards, very light gray (#F8F9FA) for page background
- **Primary accent:** Orange (associated with the Skroutz brand, from the logo and brand guidelines PDF, appears in the warm orange family around #F68B24)
- **CTA buttons:** Orange primary buttons matching brand color
- **Overall color usage:** Minimal -- predominantly white/gray with orange accents for interactive elements and promotional badges. Very clean and information-dense

### Category Pills / Navigation
- **Present:** Yes -- horizontal scrollable category chips at the top of category pages
- **Size:** Compact text pills, approximately 32-36px height
- **Icons/images:** Some categories include small icons; mostly text-based
- **Position:** Below the main navigation, above the product grid

### Desktop Space Usage
- **Contained layout** with a max-width container (approximately 1200px), centered on page
- **Distribution:** ~20% sidebar (filters) + ~80% main content grid

### Typography
- **Font family:** Inter (all weights 100-900) as primary; Inter Display for emphasis; Satoshi as secondary. Historically used Verdana
- **Product title weight:** Regular to Medium (400-500) -- titles are information-dense with specifications
- **Title vs price size:** Titles are ~14px; prices are ~18-20px and bolder, creating clear hierarchy

---

## 2. Wolt.com -- Food Delivery Platform

### Product Cards (Restaurant Cards)
- **Image shape:** Landscape rectangle for restaurant cards; images fill the top portion of the card
- **Aspect ratio:** Approximately 16:10 or 3:2 for the hero image portion of restaurant cards
- **Info shown:** Restaurant name, cuisine type tags, delivery time estimate, delivery fee, star rating, promotional badges ("Free delivery", "New"), restaurant photo
- **Price display:** Delivery fee shown as secondary info (small text); no product-level pricing on restaurant cards -- pricing appears on the menu items inside
- **Add-to-cart button:** Not on restaurant listing cards; "+" add buttons appear on individual menu items inside the restaurant view
- **Corner radius:** Generous -- approximately 12-16px, giving a friendly, modern feel
- **Shadow/border:** Subtle card shadow: `0 1px 10px rgba(0,0,0,10%)` for small cards, `0 5px 20px rgba(0,0,0,13%)` for standard cards. No visible border -- shadow creates the boundary
- **Padding:** Internal padding approximately 16-20px below the image

### Layout & Grid
- **Cards per row (desktop):** 3-4 restaurant cards per row in the main discovery feed
- **Grid type:** Contained max-width layout, roughly 1200-1440px
- **Gap between cards:** ~20px column gap, ~20px row gap
- **Sidebar:** No sidebar for filters on the main discovery page; category-based navigation is handled through horizontal scrolling

### Colors
- **Background:** White (#FFFFFF) primary, light gray (#F9F9F9) for sections
- **Primary accent:** Blue (#0057FF) -- Wolt's signature brand color
- **CTA buttons:** Blue (#0057FF) background with white text, approximately 32px height with 8px vertical padding
- **Text colors:** Dark gray/black (#191919) for primary text, medium gray (#696969) for secondary
- **Border color:** Light gray (#E8E8E8)
- **Overall color usage:** Very clean, minimal. Blue used sparingly for CTAs and interactive elements. Photography carries most of the visual weight

### Category Pills / Navigation
- **Present:** Yes -- prominent horizontal scrollable category pills
- **Size:** Medium-sized circular icons with labels underneath, or horizontal chips
- **Icons/images:** Yes -- Wolt uses custom playful illustrated icons (recently redesigned icon system with a "playful" aesthetic) inside circular containers
- **Position:** Top of the discovery page, horizontally scrollable. Icons appear in circular frames with pastel-colored backgrounds

### Desktop Space Usage
- **Semi-contained** -- content area uses a max-width with generous margins
- **Full-width hero/banners** at the top, then contained grid for cards

### Typography
- **Font family:** Helvetica / Arial (system sans-serif stack)
- **Title size:** Restaurant names at approximately 16-20px, bold weight
- **Secondary text:** 14px normal weight for delivery info, cuisine tags
- **Caption:** 14px italic for special callouts
- **Line heights:** 1.1em for titles, 1.4em for body text
- **Overall:** Clean sans-serif throughout; no serif fonts

---

## 3. Instacart.com -- Grocery Delivery

### Product Cards
- **Image shape:** Square product images on a clean/white background
- **Aspect ratio:** 1:1 (square) -- standard for grocery items, matching how packaged goods are photographed
- **Info shown:** Product image, product name, weight/size, price, unit price (price per oz/lb), store badges, "Add" button
- **Price display:** Bold, dark text, approximately 16-18px. Unit pricing shown in smaller gray text below. Sale prices shown in green or red with original price struck through
- **Add-to-cart button:** YES -- prominent green "+" or "Add" button directly on every product card. This is the key interaction pattern. After first add, it becomes a quantity stepper (+/- buttons)
- **Corner radius:** Moderate -- approximately 8-12px on cards
- **Shadow/border:** Light border (1px light gray #F4F4F4), minimal shadow -- relies more on border for card definition
- **Padding:** Tight padding, approximately 8-12px. Image fills most of the card

### Layout & Grid
- **Products per row (desktop):** 5-6 products per row on wide screens; 4 on medium
- **Grid type:** Contained within max-width (~1440px desktop)
- **Gap between cards:** Tight -- approximately 12-16px
- **Sidebar:** Left sidebar for filters (store selection, dietary preferences, brand, price range) on category pages; no sidebar on homepage

### Colors
- **Background:** White (#FFFFFF) for cards and page
- **Primary accent:** Vibrant green (#0AAD05) -- representing freshness and nature
- **Secondary:** Dark navy/forest (#003D29) -- used for headers and primary navigation backgrounds
- **Accent:** Orange (#FF7009) -- for deals and promotional elements
- **CTA buttons:** Green (#0AAD05) for add-to-cart; dark green for primary navigation
- **Overall color usage:** Clean and minimal. Green dominates for actions, white dominates for content. Photography of products is the visual focus

### Category Pills / Navigation
- **Present:** Yes -- store/retailer pills at the top (showing available stores like Costco, Kroger, etc.) and category pills within store views
- **Size:** Medium -- approximately 40-48px height with rounded pill shape
- **Icons/images:** Yes -- store logos in retailer pills; small category icons in some views
- **Position:** Horizontal scrollable row at the top of the page

### Desktop Space Usage
- **Contained** -- max-width approximately 1440px
- **When sidebar present:** ~240px sidebar + remaining space for product grid

### Typography
- **Font family:** Custom "Instacart Sans" (proprietary) + "Instacart Contrast" for display. Fallback to system sans-serif. Playfair Display used for some marketing/display headings; Graphik for captions/labels
- **Product title weight:** Regular (400) -- brief, descriptive product names
- **Title size:** ~14px for product names
- **Price size:** ~16-18px bold (600 weight)
- **Navigation:** 12px, 700 weight, uppercase

---

## 4. Amazon Fresh / Grocery

### Product Cards
- **Image shape:** Square product images on mandatory pure white backgrounds (Amazon product image policy)
- **Aspect ratio:** 1:1 (square) for listing thumbnails
- **Info shown:** Product image, product title (verbose -- includes brand, product name, size/count, flavor), star rating with review count, price, Prime/Subscribe & Save badges, "Add to Cart" button, "Best Seller" or "Amazon's Choice" badges
- **Price display:** Large bold price (~18-20px) in dark text. Superscript cents pattern (e.g., "$4.99" where "$4" is large and ".99" is smaller superscript). Deal prices in red. "Was" prices struck through in gray
- **Add-to-cart button:** YES -- yellow/gold "Add to Cart" button below each product card. Amazon's signature gold (#FFD814) with dark text. Some items show quantity selector dropdown before the button
- **Corner radius:** Minimal -- approximately 4-8px. Amazon uses relatively sharp corners
- **Shadow/border:** Very subtle. Light gray border on hover; minimal shadow. Amazon relies on whitespace rather than shadows for separation
- **Padding:** Moderate -- approximately 12-16px

### Layout & Grid
- **Products per row (desktop):** 4-5 products per row in grid view; also offers list view
- **Grid type:** Full-width (Amazon uses nearly the entire viewport with a max-width around 1500px)
- **Gap between cards:** ~16-20px
- **Sidebar:** Yes -- extensive left sidebar with department filters, brand, price range, dietary preferences, subscription options, average customer review, climate pledge, etc. Sidebar takes ~220-260px

### Colors
- **Background:** White (#FFFFFF) everywhere
- **Primary accent:** Amazon Orange (#FF9900) for logo and accents
- **CTA buttons:** Gold/Yellow (#FFD814) for "Add to Cart" -- Amazon's most recognizable UI element
- **Link color:** Teal/Blue (#007185) for product titles (clickable links)
- **Overall color usage:** Very utilitarian. Minimal color. White, gray, with yellow CTA buttons and blue links. Information-dense, function over form

### Category Pills / Navigation
- **Present:** Yes -- "Fresh Categories" horizontal row with text-based category links
- **Size:** Compact text links, not pills per se -- more traditional text navigation
- **Icons/images:** Category images appear in grid tiles on the Fresh homepage (large ~200x200px tiles), but navigation is text-heavy
- **Position:** Below main Amazon navigation bar

### Desktop Space Usage
- **Near full-width** -- Amazon maximizes information density. Content stretches to ~1500px+
- **With sidebar:** ~16% sidebar + ~84% content grid

### Typography
- **Font family:** Amazon Ember (proprietary sans-serif). Very similar to Bookman/Helvetica Neue
- **Product title weight:** Regular (400) -- titles are link-colored (teal) and quite long/descriptive
- **Title size:** ~14-15px for listing titles
- **Price size:** ~18-22px, bold -- prices are prominently sized
- **Overall:** Purely functional typography. No decorative fonts

---

## 5. DoorDash.com -- Food Delivery

### Product Cards (Restaurant Cards)
- **Image shape:** Landscape rectangle for the restaurant hero image, filling the top portion of vertical cards
- **Aspect ratio:** Approximately 16:9 to 2:1 for the image portion; overall card is portrait orientation
- **Info shown:** Restaurant photo, restaurant name, cuisine type, star rating, number of ratings, delivery time, delivery fee, distance, promotional badges ("$0 delivery fee"), "DashPass" badge
- **Price display:** Price indicator shown as "$", "$$", "$$$" (price tier) rather than exact amounts. Delivery fee shown in small text
- **Add-to-cart button:** No direct add-to-cart on restaurant cards; menu items inside have "+" buttons
- **Corner radius:** Moderate to generous -- approximately 12-16px for card corners; image corners match
- **Shadow/border:** Subtle shadow on hover; mostly relies on whitespace for card separation
- **Padding:** ~16px below image for text content

### Layout & Grid
- **Products per row (desktop):** 3 restaurant cards per row (standard), sometimes 2 for featured/promoted
- **Grid type:** Contained max-width, approximately 1200-1400px
- **Gap between cards:** ~16-24px
- **Sidebar:** Left sidebar with filters on some views (cuisine type, price range, dietary, rating); collapsible

### Colors
- **Background:** White (#FFFFFF) primary
- **Primary accent:** "Chilli Red" (#FF3008) -- a vivid warm red that leans slightly orange
- **Secondary colors:** Navy blue, vibrant yellow, melon pastel, teal (for secondary elements)
- **CTA buttons:** Red (#FF3008) for primary actions
- **Overall color usage:** Clean white base with red accents. Photography dominates visual interest. Selective use of color for badges and CTAs

### Category Pills / Navigation
- **Present:** Yes -- prominent horizontal category row with icons
- **Size:** Medium -- approximately 40-48px height. Rounded pills
- **Icons/images:** Yes -- small illustrative icons (food type icons: pizza, sushi, burgers, etc.) alongside text labels
- **Position:** Sticky horizontal row below the header; scrollable

### Desktop Space Usage
- **Contained** -- max-width approximately 1200-1400px, centered
- **Generous whitespace** around content grid

### Typography
- **Font family:** TT Norms Pro (proprietary sans-serif) -- clean, modern with slightly rounded terminals
- **Restaurant name weight:** Bold (700) -- strong visual hierarchy
- **Secondary info:** Regular weight, smaller size (~13-14px)
- **Title size:** ~16-18px for restaurant names
- **Overall:** Clean sans-serif throughout; bold weights for emphasis on key information (names, ratings)

---

## 6. Etsy.com -- Artisan / Maker Marketplace

### Product Cards
- **Image shape:** Square in search results grid (recently updated to 1:1 on desktop search)
- **Aspect ratio:** 1:1 (square) for desktop search thumbnails. Mobile shows closer to 4:5. Etsy recommends 2000x2000px (square) for optimal display despite officially recommending 4:3
- **Info shown:** Product image (seller photography, not standardized), product title, price, shop name, star rating, review count, "Free shipping" badge, heart/favorite button. Some show "Bestseller" or "Star seller" badges
- **Price display:** Bold, dark text (~16px), positioned below the title. Sale prices show original price struck through with the new price in green or dark text. "Sale" label appears when discounted
- **Add-to-cart button:** NO direct add-to-cart on listing cards. The heart/favorite button is the primary card interaction. Users must click through to the product page to purchase
- **Corner radius:** Moderate -- approximately 8-12px for image corners. Cards themselves are borderless (Etsy uses a "floating" card style where the image and text below it form the card without a visible boundary)
- **Shadow/border:** No card border or shadow. Clean, floating design. The grid itself provides visual organization. Hover state subtly underlines the title
- **Padding:** Minimal -- images are edge-to-edge, with ~8-12px padding for text content below

### Layout & Grid
- **Products per row (desktop):** 4 products per row in standard search results
- **Grid type:** Contained max-width (approximately 1400px)
- **Gap between cards:** ~16-24px
- **Sidebar:** Left sidebar with extensive filters (category, price range, shipping, seller location, item type, color, material, etc.)

### Colors
- **Background:** White (#FFFFFF) for content; some pages use very light warm gray
- **Primary accent:** Blaze Orange (#F56400) -- used for CTAs and interactive elements
- **CTA buttons:** Orange (#F56400) for primary actions like "Add to cart" (on product pages) and "Favorite" button fill
- **Text color:** Mine Shaft dark gray (#222222) for primary text
- **Overall color usage:** Very minimal and restrained. White dominates. Orange used sparingly for key actions. The product photography carries ALL the visual weight and character. The platform "gets out of the way" of the makers' imagery

### Category Pills / Navigation
- **Present:** Yes -- Etsy has a robust mega-menu navigation with category browsing
- **Homepage:** Features large circular category tiles with images and a curated editorial feel
- **Size:** Large category tiles on homepage (~120-160px diameter circles); smaller text-based nav in the header
- **Icons/images:** Category imagery uses styled photography in circular crops
- **Position:** Main horizontal navigation bar with dropdown mega-menus; editorial category sections on homepage

### Desktop Space Usage
- **Contained** -- max-width approximately 1400px
- **Clean and spacious** -- generous whitespace between sections
- **Light, airy experience** with abundant whitespace -- the platform avoids visual clutter despite millions of listings

### Typography
- **Font family:** Guardian Egyptian (serif) for display/marketing headings with Georgia as fallback. Sans-serif (likely Graphik or similar) for product titles and UI text
- **Product title weight:** Regular (400) -- titles are seller-written and vary in quality
- **Title size:** ~14px for listing titles
- **Price size:** ~16px bold
- **Overall:** Mixed typography -- serif for brand/editorial feel, sans-serif for functional UI. This gives Etsy a more artisanal, editorial quality compared to purely utilitarian marketplaces

---

## Cross-Platform Comparison Matrix

| Feature | Skroutz | Wolt | Instacart | Amazon Fresh | DoorDash | Etsy |
|---------|---------|------|-----------|-------------|----------|------|
| **Image ratio** | 4:5 / 1:1 adaptive | 16:10 / 3:2 | 1:1 (square) | 1:1 (square) | 16:9 / 2:1 | 1:1 (square) |
| **Cards/row (desktop)** | 4-5 | 3-4 | 5-6 | 4-5 | 3 | 4 |
| **Add-to-cart on card** | No | No | YES (+) | YES (gold) | No | No |
| **Corner radius** | 8-12px | 12-16px | 8-12px | 4-8px | 12-16px | 8-12px |
| **Card shadow** | Hover only | Yes (subtle) | Border, no shadow | Minimal | Hover only | None |
| **Background** | White/Light gray | White/Light gray | White | White | White | White |
| **Accent color** | Orange | Blue | Green | Orange/Gold | Red | Orange |
| **Filter sidebar** | Yes (left) | No | Yes (left) | Yes (left) | Optional (left) | Yes (left) |
| **Category pills** | Yes (text) | Yes (icons+text) | Yes (logos+text) | Text links | Yes (icons+text) | Mega-menu / circles |
| **Font type** | Sans-serif (Inter) | Sans-serif (Helvetica) | Sans-serif (custom) | Sans-serif (Ember) | Sans-serif (TT Norms) | Serif + Sans-serif mix |
| **Price prominence** | Very high (core UX) | Low (delivery fees) | High (bold) | Very high (large) | Medium (tier $-$$$) | High (bold) |
| **Max-width** | ~1200px | ~1200-1440px | ~1440px | ~1500px+ | ~1200-1400px | ~1400px |

---

## Key Patterns Observed

### Universal Patterns (All or Most Platforms Share These)
1. **White backgrounds** are universal -- every platform uses white for cards and white or very light gray for page backgrounds
2. **Sans-serif typography** dominates for product/functional text
3. **Left sidebar for filters** is the standard for product catalog pages (4 of 6 platforms)
4. **Horizontal category navigation** appears on every platform, positioned near the top
5. **Contained max-width layouts** (1200-1440px) are standard -- no platform uses truly full-width for product grids
6. **Photography carries the visual weight** -- platforms keep UI chrome minimal so products shine
7. **Corner radius 8-16px** is the modern standard (sharp corners like Amazon feel dated)
8. **Hover state lift** (-translateY + shadow increase) is near-universal for product cards

### Grocery/Food-Specific Patterns (Instacart, Amazon Fresh)
1. **Square 1:1 images** are the standard for packaged grocery products
2. **"Add to cart" button directly on the card** is expected in grocery -- this is a conversion-critical pattern
3. **Quantity stepper** (+ / -) replaces the add button after first item is added
4. **Unit pricing** (per kg/lb/oz) is shown alongside the sticker price
5. **Dense grids** (5-6 per row) to maximize browse efficiency -- grocery shopping is a high-volume, utility activity
6. **Badge system** for dietary/quality markers (organic, non-GMO, etc.)

### Artisan/Maker-Specific Patterns (Etsy)
1. **Photography is everything** -- the platform intentionally stays minimal so maker imagery dominates
2. **No add-to-cart on cards** -- artisan purchases are considered decisions, not impulse adds
3. **Heart/favorite button** is the primary card interaction -- builds lists, creates engagement
4. **Seller/maker identity** is prominent (shop name, seller badges)
5. **Serif fonts for editorial feel** -- Etsy uses Guardian Egyptian to signal craft and artisanal quality
6. **Borderless floating cards** -- no boxes around products, creating a gallery-like feel

### Food Delivery Patterns (Wolt, DoorDash)
1. **Landscape images** -- restaurant/food photography benefits from wider aspect ratios that show ambiance and food
2. **Fewer cards per row** (3-4) -- each card is larger and more immersive
3. **Time and logistics info** (delivery time, fee) is prominent metadata
4. **Playful illustrated icons** for category navigation
5. **Generous corner radius** (12-16px) creates a friendly, approachable feel

---

## Recommendations for Dixis

Dixis occupies a unique position: it is a **grocery/food e-commerce site** (like Instacart) but with an **artisan/maker identity** (like Etsy), focused on **Greek specialty products** with a **premium positioning**. The design should blend the functional efficiency of grocery platforms with the editorial warmth of artisan marketplaces.

### Image Strategy

**Recommendation: Use 1:1 (square) aspect ratio as the default.**

Rationale: Both grocery platforms (Instacart, Amazon) and Etsy use square images. This is the most versatile ratio: it works well in responsive grids, prevents awkward crops, and is the industry standard for product photography. For Greek artisan products (olive oil bottles, honey jars, herbs), square framing works naturally.

Implementation:
```
aspect-ratio: 1 / 1 (already implemented in current ProductCard.tsx as aspect-square)
Minimum image resolution: 800x800px, recommended 1200x1200px
Background: Warm neutral (not sterile white) -- use a linen/parchment tone for product photography
```

**Current status:** Dixis already uses `aspect-square` (1:1) on ProductCard.tsx -- this is correct and should be retained.

### Product Card Design

**Recommendation: Retain current card structure but refine details.**

Specific specs:
- **Corner radius:** 16px (`rounded-2xl`, already implemented) -- this aligns with the warmer, more approachable end of the spectrum (Wolt/DoorDash territory rather than Amazon's sharp 4px). Correct for premium artisan positioning
- **Shadow:** Current `shadow-sm` to `shadow-lg` on hover is good. Consider using the dedicated card shadow tokens: `0 2px 8px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.04)` for default, stronger on hover (already in tailwind.config.ts as `shadow-card`)
- **Border:** Keep the subtle `border border-neutral-100` -- this provides definition without heaviness
- **Hover effect:** `-translate-y-1` with `shadow-lg` transition (already implemented) -- matches the universal pattern
- **Card background:** White (#FFFFFF) -- universal standard, already implemented
- **Internal padding:** 12-16px (`px-3 sm:px-4`) -- already implemented and correct

### Add-to-Cart on Card

**Recommendation: YES -- keep the add-to-cart button directly on the card.**

Rationale: As a food/grocery e-commerce platform, Dixis should follow the Instacart/Amazon Fresh pattern of having the add-to-cart action directly accessible on the card. This is critical for conversion in grocery/food shopping where users browse and add multiple items. The current implementation already has this via `AddToCartButton` on the card.

Specific specs:
- Button should be the primary brand green (#1a7a3e, already implemented)
- On mobile, full-width button (already implemented with `w-full sm:w-auto`)
- After adding, show a quantity stepper (+/-) like Instacart
- Button height: minimum 36px for touch targets (44px recommended for accessibility)

### Price Display

**Recommendation: 16-18px, semibold (600 weight), dark text.**

Specific specs:
- **Standard price:** `text-base sm:text-lg font-semibold text-neutral-900` (already implemented)
- **Discount price:** `text-red-600` (already implemented)
- **Original price (struck through):** `text-xs sm:text-sm font-normal text-neutral-400 line-through` (already implemented)
- **Unit price:** Consider adding per-unit pricing (e.g., "EUR 12.50/kg") in `text-xs text-neutral-500` below the main price -- this is a grocery standard from both Instacart and Amazon

### Layout & Grid

**Recommendation: 4 cards per row on desktop, contained max-width.**

Specific specs:
- **Desktop (1280px+):** 4 columns
- **Tablet (768-1279px):** 3 columns
- **Mobile (below 768px):** 2 columns
- **Max-width:** 1280px for the content container (this positions Dixis between the tighter 1200px of Skroutz and the wider 1440px of Instacart -- appropriate for a premium feel that does not feel crowded)
- **Grid gap:** 16px on mobile, 20-24px on desktop
- **Sidebar:** Yes, left sidebar for filters on catalog pages, approximately 240-280px wide. Collapsible/drawer on mobile

The current ProductCard image `sizes` attribute already reflects this: `(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw` -- this maps to 2, 3, 4 columns.

### Colors

**Recommendation: Keep current green-based palette; refine accent usage.**

The current Dixis palette is well-positioned:
- **Primary green (#1a7a3e):** Aligns with the Instacart pattern (green = freshness, food, nature). This is the right color family for a food marketplace
- **Accent gold (#c9a227):** Adds premium warmth that neither Instacart nor Amazon have. This is a differentiator
- **Accent beige/cream (#f5f0e6 / #faf8f3):** Perfect for creating a warmer, more artisanal feel compared to the sterile whites of Instacart and Amazon
- **Category pastels (Wolt-inspired):** Already implemented and well-suited for visual category differentiation

Refinements:
- **Page background:** Use `accent-cream` (#faf8f3) or `accent-beige` (#f5f0e6) instead of pure white/gray for sections -- this creates the "warm marketplace" feel that differentiates Dixis from clinical grocery platforms. The current implementation uses neutral-50 (#f8f9fa) which is too cool
- **Cards stay white (#FFFFFF)** for contrast against the warm background

### Category Navigation

**Recommendation: Wolt-inspired circular category pills with pastel backgrounds and icons.**

Dixis already has the Wolt-inspired pastel category colors defined in the design system. The implementation should follow Wolt/DoorDash patterns:

Specific specs:
- **Shape:** Circular icon containers (~64-80px diameter) with text label below, OR horizontal rounded pills (~40-48px height)
- **Icons:** Use illustrative food icons (olive, honey, herbs, etc.) inside pastel-colored circles
- **Pastel backgrounds:** Use the existing category color tokens (category-olive, category-honey, etc.)
- **Position:** Horizontal scrollable row below the header/hero
- **Active state:** Border or darker shade of the category color

### Typography

**Recommendation: Dual-font system -- serif display + sans-serif functional.**

Dixis should follow Etsy's approach of using serif fonts for editorial/display purposes and sans-serif for functional UI. This signals artisanal quality while maintaining usability.

Specific specs:
- **Display font (headings, hero text):** A serif or semi-serif font (the current `font-display` variable). Options: Playfair Display, Lora, Source Serif Pro, or a Greek-supporting serif
- **Functional font (product titles, prices, buttons, UI):** Sans-serif (Inter, system-ui, or Geist Sans as currently configured)
- **Producer name on card:** 11-12px, uppercase, tracking-wide, semibold, muted color (already implemented as `text-[11px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-[0.08em]`)
- **Product title on card:** 14-16px, regular to medium weight, using serif display font for warmth (currently `font-display text-sm sm:text-base font-normal` -- the `font-display` class is correct)
- **Price on card:** 16-18px, semibold (600), sans-serif for clarity

### Producer/Maker Identity

**Recommendation: Follow Etsy's model -- make the producer identity prominent.**

This is a key differentiator for Dixis. Artisan food buyers care about provenance and the maker's story.

Specific specs:
- **Producer name above product title** (already implemented)
- **Producer link to profile** (already implemented with `producerUrl`)
- **Cultivation/quality badges** (organic, traditional, etc.) overlaid on the image (already implemented)
- Consider: small producer avatar/logo in the card (like Etsy's shop branding)

### Badge System

**Recommendation: Rounded pill badges, top-left corner of image.**

Current implementation is correct and follows best practices:
- **Position:** Top-left corner of the image (`absolute top-2 left-2`)
- **Shape:** Rounded pill (`rounded-full`)
- **Size:** `text-[10px] sm:text-xs` with `px-2 py-0.5`
- **Types:** OOS (gray), Seasonal (amber), Discount (red), Cultivation (green/purple/amber)

This matches the badge patterns from Instacart (dietary badges), Amazon (Best Seller), and Etsy (Star Seller, Bestseller).

---

## Summary: What Dixis Is Doing Right (Already)

Based on this competitive analysis, the current Dixis ProductCard implementation is surprisingly well-aligned with industry best practices:

1. Square 1:1 images (matches Instacart, Amazon, Etsy)
2. Add-to-cart button on card (matches Instacart, Amazon Fresh)
3. Producer name prominently displayed (matches Etsy's shop identity pattern)
4. Rounded corners 16px (aligns with Wolt/DoorDash friendly aesthetic)
5. Hover lift animation (universal pattern)
6. Badge system (matches all platforms)
7. Responsive 2/3/4 column grid (standard)
8. Green primary color (correct for food marketplace)
9. Warm accent palette (differentiator from clinical grocery apps)

## Summary: What Dixis Should Improve

1. **Page background warmth:** Switch from cool neutral-50 (#f8f9fa) to warm cream (#faf8f3) for sections where a warmer feel is appropriate
2. **Unit pricing:** Add per-unit price display (EUR/kg) below the main price
3. **Quantity stepper:** After adding to cart, transform button into +/- stepper (Instacart pattern)
4. **Heart/favorite button:** Add a heart button on cards for wishlisting (Etsy pattern -- builds engagement and return visits)
5. **Card shadow tokens:** Use the dedicated `shadow-card` and `shadow-card-hover` tokens from tailwind.config.ts instead of generic `shadow-sm` / `shadow-lg`
6. **Category navigation:** Build Wolt-style circular category pills with pastel backgrounds and food icons
7. **Photography standards:** Establish a product photography guide -- warm, styled shots (like Etsy makers) rather than clinical white-background shots (like Amazon)

---

## Platform-Specific Sources

- [Skroutz Design System Engineering Blog](https://engineering.skroutz.gr/blog/Skroutz-redesign-how-we-designed-and-implemented-our-own-Design-System/)
- [Skroutz Merchant Platform Design](https://partheniadis.com/work/skroutz)
- [Wolt Responsive Layout Grid](https://careers.wolt.com/en/blog/tech/wolt-responsive-layout-grid-a-solution-for-adaptive-and-consistent-multi)
- [Wolt Icon System Redesign](https://careers.wolt.com/en/blog/tech/wolt-icon-system-redesign)
- [Wolt UX/UI Redesign Case Study (Behance)](https://www.behance.net/gallery/175151187/Wolt-Food-Delivery-App-Redesign-UXUI-Case-Study)
- [Instacart Brand Guide](https://heyitsinstacart.com/)
- [Instacart Brand Colors](https://heyitsinstacart.com/color/)
- [Instacart Media Dimensions](https://docs.instacart.com/storefront/learn_about_your_storefront/merchandising_opportunities/media_dimensions/)
- [DoorDash Brand & Typography](https://typetype.org/font-in-use/doordash/)
- [DoorDash Design](https://about.doordash.com/en-us/design)
- [DoorDash Brand Colors](https://www.brandcolorcode.com/doordash)
- [Etsy Design Style Analysis](https://elements.envato.com/learn/etsy-design-style)
- [Etsy Image Size Guide (Updated 2026)](https://www.growingyourcraft.com/blog/etsy-listing-photo-optimal-size-aspect-ratio)
- [Etsy Brand Colors](https://mobbin.com/colors/brand/etsy)
- [Instacart Brand Colors](https://mobbin.com/colors/brand/instacart)
