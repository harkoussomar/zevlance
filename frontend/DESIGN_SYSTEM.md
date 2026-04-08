# FreelanceHub Design System

**Version:** 1.0  
**Stack:** Next.js 16 · Tailwind CSS v4 · shadcn/ui · TypeScript  
**Aesthetic:** Premium & Restrained — *Ivory Atelier (light) / Indigo Noir (dark)*

---

## Philosophy

> **Whisper, don't shout.**

The interface serves the work, not itself. Every visual decision should reduce friction, establish trust, and communicate professionalism. We take cues from Linear and Vercel — not because they are trendy, but because they solved the same problem: helping technical people do serious work without visual noise.

Three principles govern all decisions:

1. **Purposeful motion** — animation signals state changes, not decoration
2. **Chromatic restraint** — colour is information, not identity
3. **Typographic hierarchy** — one display font, one UI font, no exceptions

---

## Typography

### Typefaces

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| **Display** | Bricolage Grotesque | 400 · 500 · 600 · 700 · 800 | All headings (h1–h6), hero copy, section titles |
| **UI / Body** | DM Sans | 300 · 400 · 500 · 600 · 700 | All body text, UI labels, navigation, buttons |
| **Code** | DM Mono | 300 · 400 · 500 | Code blocks, keyboard shortcuts, technical data |

### Setup in `layout.tsx`

```tsx
import { Bricolage_Grotesque, DM_Sans, DM_Mono } from "next/font/google"

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
})
const sansFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
})
const monoFont = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500"],
})

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
```

### Scale

| Token | Size | Leading | Weight | Usage |
|-------|------|---------|--------|-------|
| `text-6xl` | fluid ~72px | `leading-none` | 800 | Landing h1 only |
| `text-5xl` | fluid ~48px | `leading-[1.1]` | 700 | Section hero titles |
| `text-4xl` | fluid ~36px | `leading-[1.15]` | 700 | Page titles |
| `text-3xl` | 30px | `leading-tight` | 700 | Card headlines |
| `text-xl`  | 20px | `leading-snug` | 600 | Sub-headings |
| `text-base` | 16px | `leading-relaxed` | 400 | Body paragraph |
| `text-sm`   | 14px | `leading-relaxed` | 400 | UI labels, captions |
| `text-xs`   | 12px | `leading-normal` | 500/600 | Badges, tags, meta |
| `text-[10px]` | 10px | `leading-4` | 700 | Uppercase tracking labels only |

**Rule:** `text-[10px]` must always be paired with `font-bold tracking-widest uppercase`.

---

## Colour System

### Architecture (2-layer)

```
LAYER 1 — Primitives   (raw OKLCH values, not used directly in components)
LAYER 2 — Semantics    (CSS vars aliasing primitives, used everywhere)
```

Never reference a primitive directly in a component. Always go through the semantic alias.

```tsx
// ✅ correct
className="bg-primary text-primary-foreground"
className="border-border"
className="text-muted-foreground"

// ❌ wrong
className="bg-indigo-500"         // too specific, breaks theming
className="bg-[oklch(0.545_0.215_265)]"  // never
```

### Semantic palette

| Token | Light | Dark | Meaning |
|-------|-------|------|---------|
| `--background` | warm white | deep indigo dark | Page background |
| `--foreground` | deep indigo-tinted black | warm light grey | Primary text |
| `--card` | pure white | slightly lighter than bg | Card surfaces |
| `--primary` | indigo 500 | indigo 400+ | Brand actions, links |
| `--muted` | neutral-100 | neutral-dark | Subtle fills |
| `--muted-foreground` | neutral-500 | medium grey | Placeholder, helper text |
| `--border` | neutral-200 | dark indigo-tinted | All borders |
| `--ring` | = primary | = primary | Focus rings |

### Status palette

| Token | Meaning | Usage |
|-------|---------|-------|
| `--success` | Emerald | OPEN status, successful actions, freelancer role |
| `--warning` | Amber | Pending items, expiring contracts |
| `--destructive` | Red | Errors, CANCELLED status, danger actions |
| `--info` | Blue | IN_PROGRESS status, informational alerts, client role |

### Role palette

| Token | Role |
|-------|------|
| `--role-client` | Blue — authority, structure |
| `--role-freelancer` | Emerald — growth, craft |
| `--role-admin` | Rose — power, access |

---

## Motion

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 100ms | Hover colour changes, opacity toggles |
| `--duration-base` | 200ms | All state transitions (default) |
| `--duration-slow` | 300ms | Panels, modals, page transitions |

### Easing

| Token | Curve | Usage |
|-------|-------|-------|
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `--ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering the screen |
| `--ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving the screen |
| `--ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.075)` | Playful confirmations (rare) |

### Rules

- Only animate `transform`, `opacity`, `color`, `background-color`, `border-color`, `box-shadow`
- Never animate `width`, `height`, `padding`, `margin` directly (use `max-height` or `scale` trick)
- Hover states: `--duration-fast` with `--ease-standard`
- Panel open/close: `--duration-slow` with `--ease-decelerate`

---

## Spacing

Built on Tailwind's 4px base grid. The system uses a **comfortable** density — breathing room without waste.

| Token | px | Common usage |
|-------|-----|-------------|
| `gap-1` | 4px | Icon + label tight |
| `gap-1.5` | 6px | Icon + label comfortable |
| `gap-2` | 8px | Inline elements |
| `gap-3` | 12px | Form groups, list items |
| `gap-4` | 16px | Component spacing (default) |
| `gap-6` | 24px | Card content sections |
| `gap-8` | 32px | Between cards in a grid |
| `gap-16` | 64px | Section-to-section |

**Section vertical padding:** `py-24` for public pages, `py-8` for dashboard pages.

---

## Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-xs` (4px) | `rounded-sm` | Badges, tags (xs size) |
| `--radius-sm` (6px) | `rounded-md` | Badges, tags, buttons sm |
| `--radius-md` (8px) | `rounded-lg` | Inputs, buttons, menus |
| `--radius-lg` (10px) | via `rounded-[var(--radius-lg)]` | Cards (default) |
| `--radius-xl` (12px) | `rounded-xl` | Cards (alternative) |
| `--radius-2xl` (16px) | `rounded-2xl` | Large hero cards |
| `9999px` | `rounded-full` | Avatars, status dots, pill badges |

---

## Components

### Badge

Replaces: `StatusBadge`, `CategoryBadge`, inline category spans, role badges in `Topbar`.

```tsx
import { Badge, StatusBadge, CategoryBadge, RoleBadge } from "@/components/ui/badge"

// Generic badge
<Badge variant="success" dot pulse size="sm">Live</Badge>
<Badge variant="outline" uppercase>Featured</Badge>

// Presets — preferred for consistency
<StatusBadge status="OPEN" />
<StatusBadge status="IN_PROGRESS" />
<CategoryBadge category="WEB_DEV" />
<RoleBadge role="FREELANCER" />
```

**Rule:** Always use `StatusBadge`, `CategoryBadge`, or `RoleBadge` presets where they apply. Only use raw `Badge` for custom content.

### SectionLabel

Replaces the 3× duplicated `SectionLabel` in `FeaturesSection`, `TestimonialsSection`, `HowItWorksSection`.

```tsx
import { SectionLabel } from "@/components/ui/section-label"

<SectionLabel>Platform</SectionLabel>
<SectionLabel align="center">Testimonials</SectionLabel>
<SectionLabel color="muted">Internal</SectionLabel>
```

### Tag

For skills, filters, taxonomy chips.

```tsx
import { Tag, TagGroup } from "@/components/ui/tag"

// Static skill tags
<TagGroup>
  <Tag>TypeScript</Tag>
  <Tag>React</Tag>
  <Tag>Next.js</Tag>
</TagGroup>

// Removable filter chips
<Tag variant="primary" removable onRemove={() => removeFilter("TypeScript")}>
  TypeScript
</Tag>

// Interactive filter (clickable)
<Tag variant="outline" onClick={() => toggleFilter("Remote")}>
  Remote
</Tag>
```

**When to use Tag vs Badge:**
- `Badge` — carries semantic status meaning (OPEN, CANCELLED, role)
- `Tag` — content-neutral label, typically user-generated or filterable

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

// Default
<Card>...</Card>

// Interactive (hover lift)
<Card variant="interactive" className="group">
  <CardAccentBar />   {/* top accent line appears on hover */}
  ...
</Card>

// Dark (used in CTA sections)
<Card variant="dark" padding="xl">...</Card>
```

### Skeleton

```tsx
import { Skeleton, SkeletonCard, SkeletonProjectRow, SkeletonProfile } from "@/components/ui/skeleton"

// Primitive
<Skeleton className="h-4 w-48" />

// Preset compositions
<SkeletonCard />
<SkeletonProjectRow />
<SkeletonProfile />
```

### Avatar

Backward-compatible with existing `Sidebar` and `Topbar` usage.

```tsx
import { Avatar, AvatarGroup, AvatarWithLabel } from "@/components/ui/avatar"

<Avatar name="Omar Koussi" size="sm" />
<Avatar name="Sara D." src={user.avatar} size="lg" />

<AvatarGroup
  items={[{ name: "Omar" }, { name: "Sara" }, { name: "Layla" }]}
  max={3}
  size="sm"
/>

<AvatarWithLabel
  name="Omar Koussi"
  label="Omar Koussi"
  sublabel="omar@example.com"
  size="sm"
/>
```

---

## Naming Conventions

### Files

```
components/
  ui/           ← shadcn + design system primitives (badge, card, tag…)
  modules/      ← feature-specific composed components
  layout/       ← Navbar, Sidebar, Topbar, Footer
  sections/     ← Landing page sections (Hero, Features, CTA…)
```

### Component props

- Variant props: `variant`, `size`, `align`, `color`
- Boolean props: `disabled`, `loading`, `uppercase`, `removable`, `interactive`
- Callback props: `onRemove`, `onChange`, `onSelect`
- Slot props: `icon`, `suffix`, `action`

### CSS variables

- Primitives: `--{scale}-{step}` → `--indigo-500`, `--neutral-200`
- Semantics: `--{role}` → `--primary`, `--muted-foreground`, `--border`
- Status: `--{name}`, `--{name}-foreground` → `--success`, `--success-foreground`
- Custom: `--{namespace}-{property}` → `--sidebar-width`

---

## Anti-patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Define `SectionLabel` inline in a section component | Import from `@/components/ui/section-label` |
| Use `text-emerald-600` for a "success" state | Use `text-success` |
| Write `bg-indigo-500/10 text-indigo-600 border-indigo-500/20` | Use `<Badge variant="default">` |
| Use `<div className="animate-ping ...">` for status | Use `<Badge dot pulse>` |
| Hard-code `w-60` for the sidebar | Use `var(--sidebar-width)` |
| Animate `height` | Use `max-height` transition or Radix Collapsible |
| Use `font-bold text-[10px] tracking-widest uppercase` inline | Use `<SectionLabel>` or `<Badge uppercase>` |

---

## File index

```
src/
├── app/
│   └── globals.css              ← Token system (this system)
├── components/
│   └── ui/
│       ├── avatar.tsx           ← Avatar, AvatarGroup, AvatarWithLabel
│       ├── badge.tsx            ← Badge, StatusBadge, CategoryBadge, RoleBadge
│       ├── button.tsx           ← (existing shadcn)
│       ├── card.tsx             ← Card + sub-components + CardAccentBar
│       ├── section-label.tsx    ← SectionLabel
│       ├── skeleton.tsx         ← Skeleton + preset compositions
│       └── tag.tsx              ← Tag, TagGroup
```