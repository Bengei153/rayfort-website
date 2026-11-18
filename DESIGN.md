---
name: Sovereign Executive
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#45464f'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#767680'
  outline-variant: '#c6c5d0'
  surface-tint: '#505c8c'
  primary: '#000b37'
  on-primary: '#ffffff'
  primary-container: '#15224f'
  on-primary-container: '#7e8abd'
  inverse-primary: '#b8c4fb'
  secondary: '#585f69'
  on-secondary: '#ffffff'
  secondary-container: '#d9e0ed'
  on-secondary-container: '#5c636e'
  tertiary: '#2b0001'
  on-tertiary: '#ffffff'
  tertiary-container: '#530005'
  on-tertiary-container: '#fb4c48'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b8c4fb'
  on-primary-fixed: '#091845'
  on-primary-fixed-variant: '#384473'
  secondary-fixed: '#dce3ef'
  secondary-fixed-dim: '#c0c7d3'
  on-secondary-fixed: '#151c25'
  on-secondary-fixed-variant: '#404751'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb3ac'
  on-tertiary-fixed: '#410003'
  on-tertiary-fixed-variant: '#930010'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  display-hero:
    fontFamily: Bodoni Moda
    fontSize: 4rem
    fontWeight: '600'
    lineHeight: 4.5rem
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Bodoni Moda
    fontSize: 2.5rem
    fontWeight: '600'
    lineHeight: 3rem
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 2.5rem
    fontWeight: '500'
    lineHeight: 3rem
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 1.875rem
    fontWeight: '500'
    lineHeight: 2.25rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Bodoni Moda
    fontSize: 1.75rem
    fontWeight: '500'
    lineHeight: 2.25rem
  headline-sm:
    fontFamily: Bodoni Moda
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.8rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.6rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.4rem
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.06em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '700'
    lineHeight: 1rem
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-desktop: 2.5rem
  margin: 1.5rem
  margin-desktop: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
  space-3xl: 6rem
---

## Brand & Style

This design system establishes a high-fashion, institutional aesthetic engineered to bridge two premier arms: handcrafted luxury leather goods and tier-one executive communication consulting. The visual atmosphere communicates prestige, discrete wealth, precision, and unwavering institutional competence.

### Target Audience & Emotional Intent
- **Audiences:** High-net-worth consumers seeking bespoke leather goods, alongside senior corporate executives, board directors, and institutions investing in elite executive leadership training.
- **Emotional Resonance:** Quiet confidence, timeless architectural permanence, bespoke craftsmanship, and surgical clarity. The interface must never feel rushed, discount, or noisy.

### Design Movement & Ethos
- **Movement:** Modern Editorial Minimalism merged with Haute Couture Typography.
- **Visual Expression:** Expansive breathing room, surgical hairline borders, high-contrast serif headlines reflecting editorial pedigree, and refined geometric sans-serif supporting text to deliver seamless legibility across dense curricula and boutique luxury catalogs.

## Colors

The palette is derived directly from institutional heritage: authoritative deep maritime navy, cool silver architectural metallics, crisp whites, and a focused crimson accent inspired by formal executive seals and registration marks.

### Palette Architecture & Roles
- **Primary (`#15224F`):** Sovereign Navy. Forms the backbone of high-contrast headings, primary action surfaces, executive header navigations, and grounding background sections.
- **Secondary (`#B0B7C3`):** Silver Grey. Used for hairline structural dividers, neutral interactive states, iconography backdrops, and muted metadata badges.
- **Tertiary (`#D32F2F`):** Crimson Stamp. A disciplined, high-potency accent reserved strictly for signature CTAs, limited-edition craftsmanship markers, official executive verification tags, and critical alert states.
- **Neutral Ground (`#F8F9FB` / `#FFFFFF`):** Architectural White and Alabaster. Provides a pure, luminous stage that lets leather texture photography and executive training typography breathe without interference.

## Typography

The typographic hierarchy relies on a high-fashion editorial tension: the couture high-contrast serifs of **Bodoni Moda** juxtaposed with the pristine geometric precision of **Plus Jakarta Sans**.

### Usage Directives
- **Bodoni Moda:** Assigned exclusively to displays, hero headers, section headlines, and collection titles. Never use below `1.25rem` (`20px`) to prevent delicate hairline serifs from degrading.
- **Plus Jakarta Sans:** Applied to long-form executive syllabus texts, technical product specifications, labels, interface controls, and numerical readouts.
- **All-Caps Labels:** When rendering `label-md` or `label-sm`, apply uppercase transform with extended letter-spacing (`0.06em` to `0.08em`) to mimic stamped luxury goods and certified executive accreditation documents.

## Layout & Spacing

The layout model is governed by an architectural 12-column grid on desktop screens, transitioning smoothly into 8 columns on tablet devices and 4 columns on mobile viewport viewports.

### Grid & Density Principles
- **Generous Canvas Margins:** Desktop layouts enforce substantial perimeter margins (`margin-desktop: 4rem`), isolating the experience from browser chrome and reinforcing high-end gallery framing.
- **Rhythm & Proportions:** Vertical pacing uses generous scales (`space-2xl` and `space-3xl`) between major sections to prevent clutter and establish a rhythm akin to a bespoke showroom.
- **Catalog & Editorial Reflow:** In luxury retail modules (Rayfort Bags), products utilize asymmetrical 2-column or 3-column offsets with wide gutters (`2.5rem`), transitioning to single-column full-bleed viewports on small screens.

## Elevation & Depth

Visual hierarchy favors clean planar layering and fine architectural boundaries over heavy skeuomorphic shadows. 

### Ambient Depth Strategy
- **Layer 0 (Canvas Base):** Luminous surface (`#FFFFFF` and `#F8F9FB`) providing clean negative space.
- **Layer 1 (Card & Content Blocks):** Subtle elevation achieved via a 1px perimeter outline (`#E8ECF2`) paired with an ambient, tinted shadow: `0 8px 30px rgba(21, 34, 79, 0.04)`.
- **Layer 2 (Dropdowns & Contextual Popovers):** Elevated with increased spatial separation: `0 16px 40px rgba(21, 34, 79, 0.08)`, framed by `#B0B7C3` at 40% opacity.
- **Layer 3 (Modals & Executive Drawers):** High-level overlay backed by a deep tinted scrim: `rgba(21, 34, 79, 0.6)` with a backdrop blur of `8px`, focusing all spatial attention on the dialog.

## Shapes

The design system incorporates a disciplined, subtle corner rounding (`roundedness: 1`), keeping elements crisp, architectural, and tailored.

### Shape Hierarchy
- **Base Components (Inputs, Buttons, Badges):** Subtle `0.25rem` (`4px`) radius, echoing finely trimmed leather edges and tailored stationery.
- **Structural Containers (`rounded-lg`):** Modals, showcase cards, and image viewports use `0.5rem` (`8px`) corners.
- **Hero Vignettes & Drawers (`rounded-xl`):** `0.75rem` (`12px`) reserved for larger contextual surfaces.
- **Pill Exceptions:** Rounded pills are strictly prohibited for core UI actions and inputs; they are reserved exclusively for circular iconography, status pips, and small uppercase accreditation badges.

## Components

### Buttons & Interactive Triggers
- **Primary Action:** Solid `#15224F` navy background, white text, subtle `0.25rem` radius, padded at `0.75rem 1.75rem`. Hover state features a crisp shift with a 1px inner inset glow and subtle Crimson (`#D32F2F`) underline accent or right-aligned micro-arrow.
- **Secondary (Craftsman Outline):** 1px border of `#15224F`, transparent background, dark text. Transitions to faint `#15224F` fill at 5% opacity on hover.
- **Accent Signature (Bespoke/Enroll):** Rich crimson `#D32F2F` fill with white text, strictly reserved for immediate conversions (e.g., "Reserve Piece", "Enroll in Executive Masterclass").

### Product & Executive Cards
- **Product Card (Rayfort Bags):** Minimalist card featuring an aspect-ratio-locked imagery stage (`4:5`), delicate `#E8ECF2` bottom hairline separator, Bodoni serif product titles, and a discrete silver specification tag (`label-sm`).
- **Curriculum Card (Executive Consulting):** Structured surface utilizing a `#F8F9FB` background, 1px left border accented in Navy or Crimson, highlighting course modules, key speaker credentials, and direct certification status.

### Form Inputs & Fields
- **Text Inputs:** Low-contrast background `#FFFFFF` bordered with a 1px `#B0B7C3` stroke. Labels positioned outside in uppercase `label-sm` with active focus states transforming the border into sharp `#15224F` with zero blur rings.

### Badges, Chips & Seals
- **Accreditation Seals:** Circular or refined boxed emblems rendering the official RC registration and authenticity certifications. Rendered in monochromatic `#15224F` or `#D32F2F` stamping tint.
- **Status Chips:** Flat, unbordered pills with pale slate backgrounds (`#E8ECF2`) and `#15224F` typographic labels.

### Navigation & Header
- **Top Navigation Bar:** Full-width architectural bar in `#FFFFFF` with a bottom hairline border (`#E8ECF2`). Anchored by the dual-toned insignia on the left, centered navigation links in tracked uppercase `label-md`, and a high-contrast executive action trigger on the right.