# Add Page

## Purpose
Create a new Next.js page. Two modes: Admin (shadcn/ui) or Customer (theme-dependent).

## Steps

### 1. Create Route
```
Frontend/app/(admin)/{name}/page.tsx    ← Admin page
Frontend/app/(main)/{name}/page.tsx     ← Customer page
```

### 2A. Admin Page (shadcn/ui — always)
```typescript
import { DataTable } from '@/components/ui/data-table';
import { columns } from './_components/columns';
import { useNames } from '@/hooks/use-names';

export default function NamePage() {
  const { data, isLoading } = useNames();

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Names</h1>
        <CreateNameDialog />
      </div>
      <DataTable columns={columns} data={data?.items ?? []} />
    </div>
  );
}
```

### 2B. Customer Page (theme-dependent, mobile-first)
```typescript
import { NameCard } from '@/components/themes/{theme-name}/name-card';
import { useNames } from '@/hooks/use-names';

export default function NamePage() {
  const { data, isLoading, error } = useNames();

  if (isLoading) return <NameSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data?.items.length) return <EmptyState />;

  return (
    <div className="container mx-auto px-4 py-6">
      {data.items.map(item => <NameCard key={item.id} item={item} />)}
    </div>
  );
}
```

### 3. Add to Navigation
- Admin: add to sidebar nav config (e.g. `config/nav.ts`)
- Customer: add to header/footer nav

### 4. Required States
Every page MUST have:
- **Loading**: skeleton matching final layout
- **Error**: message + retry button
- **Empty**: illustration + helpful message + CTA
- **Data**: the actual content

### 5. Connect to API
Use `connect-api` skill to create hooks + API layer.

## Verify
- Page renders at correct route
- All 4 states work (loading, error, empty, data)
- Responsive: check mobile (375px) + tablet (768px) + desktop (1280px)
- Admin pages use shadcn components only

## NEVER
- Mix shadcn components into customer pages
- Skip loading/error/empty states
- Use client-side data fetching without React Query
- Hardcode data for demo purposes
- Skip mobile responsiveness check
