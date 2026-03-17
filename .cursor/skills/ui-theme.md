# Minimalism Theme

Clean, spacious design with maximum white space, thin borders, and muted colors. Reference: Apple.com, Linear.app, Notion.

## Design Tokens

### Colors
| Token | Value | Tailwind |
|-------|-------|----------|
| Background | `#FFFFFF` | `bg-white` |
| Surface | `#FAFAFA` | `bg-zinc-50` |
| Border | `#E4E4E7` | `border-zinc-200` |
| Text Primary | `#18181B` | `text-zinc-900` |
| Text Secondary | `#71717A` | `text-zinc-500` |
| Accent | `#2563EB` | `text-blue-600` |

### Typography
- Font: `font-sans` (Inter or system). Weight: `font-light` to `font-normal`.
- Headings: `text-2xl font-normal tracking-tight`. Body: `text-sm font-light leading-relaxed`.

### Spacing & Radius
- Padding: generous — `p-6` cards, `px-5 py-2.5` buttons. Border-radius: `rounded-none` or `rounded-sm`.

### Shadows & Borders
- Shadows: **none**. Borders: `border border-zinc-200` (1px).

## Component Patterns

| Component | Classes |
|-----------|---------|
| Card | `bg-white border border-zinc-200 rounded-sm p-6` |
| Button (primary) | `border border-zinc-900 text-zinc-900 px-5 py-2.5 rounded-sm text-sm font-normal hover:bg-zinc-900 hover:text-white transition-colors` |
| Button (ghost) | `text-zinc-500 px-5 py-2.5 text-sm hover:text-zinc-900 transition-colors` |
| Input | `border border-zinc-200 rounded-sm px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-400` |
| Badge | `text-xs text-zinc-500 border border-zinc-200 rounded-sm px-2 py-0.5` |
| Table row | `border-b border-zinc-100 text-sm text-zinc-700 py-3` |

## Example Card

```tsx
export function MinimalCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-sm p-6">
      <h3 className="text-lg font-normal tracking-tight text-zinc-900">{title}</h3>
      <p className="mt-2 text-sm font-light leading-relaxed text-zinc-500">{description}</p>
      <button className="mt-4 border border-zinc-900 text-zinc-900 px-5 py-2.5 rounded-sm text-sm hover:bg-zinc-900 hover:text-white transition-colors">
        Learn more
      </button>
    </div>
  );
}
```

## DO
1. Use generous white space — let elements breathe.
2. Stick to 1 accent color max; keep everything else monochrome.
3. Use `font-light` or `font-normal` — never bold for body.
4. Keep borders at 1px and muted (`zinc-200`).
5. Use `transition-colors` for hover — no bouncy animations.

## DON'T
1. Add drop shadows to cards or buttons.
2. Use rounded-lg or rounded-full on containers.
3. Mix more than 2 font weights on one page.
4. Use bright/saturated colors for backgrounds.
5. Add scale, bounce, or slide animations.
