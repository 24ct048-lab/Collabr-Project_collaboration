# High-End Design System Specification: The Kinetic Minimalist

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**
This design system rejects the "templated" look of generic SaaS platforms in favor of a bespoke, editorial experience. It is inspired by the precision of **Linear**, the spatial clarity of **Notion**, and the fluid depth of **Framer**. 

We move beyond a static grid by embracing **Kinetic Minimalism**. This means the interface doesn't just sit on the screen; it feels like a curated arrangement of high-end materials—glass, deep charcoal paper, and electric light. We achieve this through intentional asymmetry, massive breathing room (whitespace), and a focus on "tonal elevation" over physical borders.

---

## 2. Colors & Surface Logic
The palette is a sophisticated range of deep obsidian and slate, punctuated by a high-energy primary indigo.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** 
Structural boundaries must be defined solely through background color shifts. To separate a sidebar from a main content area, do not draw a line; instead, place a `surface-container-low` (#111319) sidebar against a `surface` (#0c0e12) main workspace. 

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create "nested" depth:
*   **Base Layer:** `surface` (#0c0e12) – The infinite canvas.
*   **Secondary Layer:** `surface-container-low` (#111319) – For sidebars and navigation wrappers.
*   **Tertiary Layer:** `surface-container` (#161a21) – For the primary workspace or content cards.
*   **Active/Elevated Layer:** `surface-container-high` (#1b2029) – For active states or modal overlays.

### The "Glass & Gradient" Rule
To escape the "flat" look, floating elements (menus, popovers) should use **Glassmorphism**. Use `surface-bright` (#252c39) at 70% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** For primary CTAs, use a subtle linear gradient from `primary` (#c3c0ff) to `primary_container` (#3424ca) at a 135-degree angle. This adds a "lithographic" quality that flat hex codes cannot achieve.

---

## 3. Typography: The Editorial Scale
We use **Inter** as our typographic backbone. The goal is high contrast between massive "Display" headers and compact, high-utility "Labels."

*   **Display (lg/md/sm):** Used for marketing heroes or major module headers. Use `display-lg` (3.5rem) with `-0.04em` letter-spacing to create a tight, professional punch.
*   **Headline & Title:** Used for page titles and section headers. These should always use `on_surface` (#e0e5f5).
*   **Body (lg/md/sm):** The workhorse. `body-md` (0.875rem) is the standard for app density.
*   **Labels:** Use `label-md` (0.75rem) in `secondary` (#949eb0) for metadata. This "recessed" color ensures the eye gravites toward primary data first.

---

## 4. Elevation & Depth
Depth is a feeling, not a drop-shadow.

### The Layering Principle
Achieve hierarchy by "stacking" tones. Place a `surface_container_lowest` (#000000) card on a `surface_container_low` (#111319) background. The 1.2% difference in luminosity creates a soft, natural lift that feels expensive and intentional.

### Ambient Shadows
When an element must float (Modals/Dropdowns), use **Ambient Shadows**:
*   **Blur:** 40px - 60px.
*   **Opacity:** 4% - 8%.
*   **Color:** Use `surface_tint` (#c3c0ff) as the shadow base rather than pure black. This mimics natural light refraction in a dark environment.

### The "Ghost Border" Fallback
If a border is required for accessibility (e.g., input fields), use a **Ghost Border**:
*   Token: `outline_variant` (#424854).
*   Opacity: Set to 15% or 20%.
*   **Never use 100% opaque borders.**

---

## 5. Components

### Buttons
*   **Primary:** `primary` (#c3c0ff) background with `on_primary` (#2c17c4) text. Apply a subtle inner-glow (1px white at 10% opacity) on the top edge.
*   **Secondary (Ghost):** No background. `outline_variant` at 20% opacity for the border. Text is `on_surface_variant`.
*   **Tertiary:** Pure text with `primary` color. High interaction padding (`spacing-2` x `spacing-4`).

### Sophisticated Form Fields
*   **Input:** Use `surface_container_highest` (#202631) as the background. 
*   **Radius:** Always `xl` (0.75rem / 12px) for a modern, friendly feel.
*   **State:** On focus, transition the border to `primary` (#c3c0ff) at 40% opacity and add a `2px` outer glow.

### Cards & Lists
*   **Strict Rule:** No dividers. Use `3.5rem` (spacing-10) of vertical whitespace or a shift to `surface_container_low` to separate items.
*   **Interactive Cards:** On hover, shift the background from `surface_container` to `surface_container_high`. Use a `0.2s ease-out` transition.

### The "Command Menu" (New Component)
A signature SaaS element. A centered modal using `surface_bright` with 80% opacity and a heavy `backdrop-blur`. This serves as the "Global Search" and "Action Hub," styled with `title-md` typography.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins (e.g., more padding on the left than the right) for editorial layouts.
*   **Do** use the full `spacing-24` (8.5rem) for section breaks to let the UI "breathe."
*   **Do** use `primary_fixed_dim` for subtle accents in non-interactive tags.

### Don't
*   **Don't** use pure `#000000` for anything other than `surface_container_lowest`. It kills the tonal depth of the grays.
*   **Don't** use standard "Drop Shadows." Always use the Ambient Shadow formula.
*   **Don't** use icons with different stroke weights. Use a single weight (e.g., 1.5px) to match the `outline` token's visual weight.
*   **Don't** crowd the interface. If a screen feels "busy," increase the spacing token by two levels.