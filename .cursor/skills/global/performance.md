# Performance

## Purpose
Ensure the application is fast by default. Prevent common performance mistakes.

## Database Rules
- **Use `include`/`join`** instead of sequential queries (prevent N+1)
- **Paginate ALL list endpoints**: default `limit=20`, max `limit=100`
- **Add indexes** on columns used in `WHERE`, `ORDER BY`, `JOIN`
- **Select only needed fields** — avoid `SELECT *`
- **Cache** frequently-read, rarely-written data (config, lookups, permissions)

## API Rules
- Every list endpoint must accept `page` + `limit` params
- Return pagination metadata: `{ data, total, page, limit, totalPages }`
- Set response timeout (default: 30s)
- Compress responses (gzip/brotli)

## Frontend Rules
- **Lazy load** heavy components: `dynamic(() => import(...))` or `React.lazy`
- **Optimize images**: use `next/image`, WebP format, proper sizing
- **Virtualize** long lists (>100 items): use `react-virtual` or similar
- **Debounce** search inputs (300ms default)
- **Memoize** expensive computations: `useMemo`, `useCallback` where needed
- **Code split** routes: each page loaded on demand

## Monitoring Thresholds
| Metric | Target | Investigate If |
|--------|--------|---------------|
| API response time | < 200ms | > 500ms |
| Page load (LCP) | < 2.5s | > 4s |
| Database query | < 50ms | > 200ms |
| Bundle size (per route) | < 200KB | > 500KB |

## Steps
1. Check new code against rules above
2. If adding a list endpoint → ensure pagination
3. If adding a query → check for N+1, add index if needed
4. If adding a component → consider lazy loading
5. Test with realistic data volumes (not just 3 test records)

## Verify
- No N+1 queries in new code
- All list endpoints paginated
- New queries use indexes
- Frontend bundles are code-split

## NEVER
- Fetch all records without LIMIT
- Load data the user hasn't requested
- Skip pagination ("we'll add it later")
- Use synchronous heavy operations on the main thread
- Pre-optimize without measuring (measure first, optimize second)
