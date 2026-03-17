# Connect API

## Purpose
Create typed API layer connecting Frontend to Backend using React Query.

## Steps

### 1. Create Types
```typescript
// Frontend/types/{name}.ts
export interface Name {
  id: string;
  title: string;
  status: NameStatus;
  createdAt: string;
  updatedAt: string;
}

export type NameStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface NameListResponse {
  items: Name[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateNamePayload {
  title: string;
  description?: string;
}
```

### 2. Create API Functions
```typescript
// Frontend/lib/api/{name}.api.ts
import { api } from '@/lib/api/client';
import type { Name, NameListResponse, CreateNamePayload } from '@/types/{name}';

export const nameApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<NameListResponse>('/{name}', { params }),

  getById: (id: string) =>
    api.get<Name>(`/{name}/${id}`),

  create: (data: CreateNamePayload) =>
    api.post<Name>('/{name}', data),

  update: (id: string, data: Partial<CreateNamePayload>) =>
    api.patch<Name>(`/{name}/${id}`, data),

  remove: (id: string) =>
    api.delete(`/{name}/${id}`),
};
```

### 3. Create React Query Hooks
```typescript
// Frontend/hooks/use-{name}.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nameApi } from '@/lib/api/{name}.api';

const KEYS = { all: ['{name}'] as const, detail: (id: string) => ['{name}', id] as const };

export function useNames(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...KEYS.all, { page, limit }],
    queryFn: () => nameApi.list({ page, limit }),
  });
}

export function useName(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => nameApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: nameApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateNamePayload> }) =>
      nameApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: nameApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
```

### 4. Use in Components
```typescript
const { data, isLoading, error, refetch } = useNames();

if (isLoading) return <Skeleton />;              // Loading skeleton
if (error) return <ErrorState onRetry={refetch} />; // Error + retry
if (!data?.items.length) return <EmptyState />;  // Empty state
return <DataTable data={data.items} />;          // Data
```

## Verify
- TypeScript compiles: `npx tsc --noEmit`
- Hook returns correct data shape
- Mutations invalidate cache properly
- All 4 states render (loading, error, empty, data)

## NEVER
- Use `fetch()` directly in components — always go through API layer
- Use `any` type for API responses
- Skip error handling or loading states
- Forget cache invalidation after mutations
- Put API URLs in components — centralize in `lib/api/`
