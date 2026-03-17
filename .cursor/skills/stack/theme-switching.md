# Theme Switching

## Purpose
Apply different UI themes to customer-facing pages while keeping admin UI (shadcn) and backend unchanged.

## Architecture
```
Frontend/
├── app/
│   ├── (admin)/         ← Always shadcn/ui — NEVER changes
│   └── (main)/          ← Customer pages — uses theme components
├── components/
│   ├── ui/              ← shadcn components (admin only)
│   └── themes/
│       └── {theme-name}/  ← Theme-specific components
│           ├── button.tsx
│           ├── card.tsx
│           ├── header.tsx
│           ├── footer.tsx
│           ├── nav.tsx
│           └── index.ts   ← barrel export
├── hooks/               ← Shared — same for all themes
├── lib/api/             ← Shared — same for all themes
├── stores/              ← Shared — same for all themes
└── types/               ← Shared — same for all themes
```

## What Changes Per Theme
| Layer | Changes? | Notes |
|-------|----------|-------|
| Backend | ❌ Never | API is theme-agnostic |
| Admin pages | ❌ Never | Always shadcn/ui |
| Hooks / API layer | ❌ Never | Business logic is shared |
| Stores / Types | ❌ Never | Data layer is shared |
| Customer pages | ✅ Imports only | Change component imports |
| Theme components | ✅ Full replace | Visual components swap out |
| Tailwind config | ✅ Colors/fonts | Theme colors + typography |

## Switching Theme Steps

### 1. Create Theme Folder
```bash
mkdir -p Frontend/components/themes/{new-theme}
```

### 2. Create Theme Components
Each theme must export the same component interface:
```typescript
// components/themes/{theme-name}/index.ts
export { Button } from './button';
export { Card } from './card';
export { Header } from './header';
export { Footer } from './footer';
export { Nav } from './nav';
```

### 3. Update Customer Page Imports
```typescript
// Before
import { Card } from '@/components/themes/minimalism/card';
// After
import { Card } from '@/components/themes/glassmorphism/card';
```

### 4. Update Tailwind Theme Colors
```css
/* globals.css — update CSS variables */
:root {
  --primary: {theme-primary};
  --secondary: {theme-secondary};
  --background: {theme-bg};
  --foreground: {theme-fg};
}
```

## Verify
- Admin pages render correctly (unaffected by theme change)
- Customer pages use new theme components
- All shared logic (hooks, API, stores) works without changes
- Responsive check on customer pages

## NEVER
- Modify backend when switching themes
- Put theme-specific code in shared hooks/stores/types
- Use shadcn components in customer pages
- Mix components from different themes on one page
- Duplicate business logic across themes — only visual components differ
