# Design System Strategy: The Vitality Edit

## 1. Overview & Creative North Star: "The Digital Apothecary"
This design system moves beyond the "health app" cliché of generic green buttons and white cards. Our Creative North Star is **The Digital Apothecary**: a high-end, editorial-inspired experience that balances the precision of AI with the warmth of organic nutrition. 

To break the "template" look, we employ **Intentional Asymmetry** and **Tonal Depth**. We avoid rigid, centered grids in favor of left-aligned editorial layouts, oversized typography scales, and "floating" interactive elements. This creates a sense of space and breathability—essential for a health-conscious mind. The experience should feel less like a software tool and more like a premium wellness journal.

---

## 2. Colors: Tonal Immersion
We move away from stark contrasts to a sophisticated palette of nested greens and clinical whites.

### The Palette
*   **Primary (Emerald Focus):** `primary: #006948` (Emerald-600 equivalent) is our anchor of trust. Use `primary_container: #00855d` for deep, immersive backgrounds.
*   **The Neutrals:** We utilize `surface: #f7f9fb` as our base. It is a "Cool Medical White" that reduces eye strain compared to pure `#ffffff`.
*   **The Accents:** `tertiary: #9b3e3b` (Earthy Red) is reserved strictly for warnings or critical metabolic alerts, ensuring it doesn't overwhelm the "Healthy Green" serenity.

### The Rules of Application
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. To separate a recipe card from a meal plan background, use a background shift (e.g., a `surface_container_lowest` card sitting on a `surface_container_low` section).
*   **Surface Hierarchy & Nesting:** Treat the UI as layers of fine paper. 
    *   *Level 0 (Base):* `surface`
    *   *Level 1 (Sections):* `surface_container_low`
    *   *Level 2 (Interactive Cards):* `surface_container_lowest` (#ffffff)
*   **The "Glass & Gradient" Rule:** For high-end "AI" moments (like nutritional analysis), use Glassmorphism. Apply `surface_variant` at 60% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** Use subtle linear gradients for CTAs: `primary` to `primary_container`. This adds a "weighted" feel that flat color lacks.

---

## 3. Typography: Editorial Authority
We use a dual-font system to balance human warmth with data-driven precision.

*   **Display & Headlines (Manrope):** A modern geometric sans-serif. Use `display-lg` (3.5rem) with `-0.04em` letter spacing for hero nutrition scores. It conveys confidence and modernity.
*   **Body & Titles (Public Sans):** A neutral, highly legible face. This represents the "AI Assistant"—clear, objective, and easy to parse in a mobile-first context.
*   **Hierarchy as Identity:** Use extreme scale differences. A `display-sm` headline paired with a `label-md` uppercase caption creates an editorial "lookbook" feel rather than a standard form layout.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "heavy" for a clean nutrition app. We use light to define space.

*   **The Layering Principle:** Instead of shadows, use the "Step-Up" method. If your background is `surface_container_low`, your active element must be `surface_container_lowest`.
*   **Ambient Shadows:** When an element must float (e.g., a "Log Meal" FAB), use: `color: on_surface (8% opacity)`, `blur: 24px`, `y: 8px`. This mimics soft, natural sunlight.
*   **The "Ghost Border" Fallback:** If a boundary is required for accessibility, use `outline_variant` at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Use semi-transparent `surface_container_lowest` for floating navigation bars to allow the "Healthy Green" content to bleed through as the user scrolls.

---

## 5. Components: Precision & Softness

### Buttons
*   **Primary:** High-pill (`rounded-full`), `primary` background. No border. Subtle gradient transition on hover.
*   **Secondary:** `surface_container_high` background with `on_surface` text. This feels integrated into the page.

### Cards & Lists
*   **Zero-Divider Policy:** Never use horizontal rules. Use `40px` of vertical white space or a change in `surface_container` tier to indicate a new list item.
*   **Content Grouping:** Use `rounded-xl` (1.5rem) for main cards to give a soft, approachable feel.

### Input Fields
*   **Modern Interaction:** Use a "Flushed" style. No containing box; just a `surface_container_highest` bottom bar (2px) that transforms into a `primary` bar on focus. Use `label-md` for floating placeholder text.

### Nutrition-Specific Components
*   **The "Vibe" Gauge:** Use semi-circle progress charts with `primary_fixed` as the track and `primary` as the fill. 
*   **Micro-Interactions:** Lucide icons should use a `1.5pt` stroke width. When an icon is active, fill it with a 10% opacity version of the `primary` color.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use whitespace as a functional element. If it feels "empty," you're doing it right.
*   **DO** use `surface_bright` for background areas where you want to highlight user-generated content (like food photos).
*   **DO** align text-heavy editorial content to the left with wide margins (24px+) to mimic a premium magazine.

### Don’t
*   **DON'T** use pure black (#000000). Always use `on_surface` (#191c1e) for text to maintain the "Apothecary" softness.
*   **DON'T** use `rounded-none`. Everything in nature has a radius; our UI should reflect that with `rounded-md` as the minimum.
*   **DON'T** use 100% opaque borders. They create visual "noise" that contradicts the "Clean White" aesthetic.