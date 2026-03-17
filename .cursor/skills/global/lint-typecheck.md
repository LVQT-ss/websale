# Lint & Typecheck

## Purpose
Run lint and typecheck. Expect zero errors. Auto-fix if needed.

## Steps
1. **Lint**: `npm run lint` (or `pnpm lint`, `yarn lint`)
2. **Typecheck**: `npx tsc --noEmit`
3. If errors found → invoke `auto-fix` skill
4. Re-run both checks
5. Report result

## Expected Output
```
Lint: ✅ 0 errors, 0 warnings
Typecheck: ✅ 0 errors
```

## Common Commands by Stack
| Stack | Lint | Typecheck |
|-------|------|-----------|
| Next.js | `next lint` | `tsc --noEmit` |
| NestJS | `eslint "{src,apps,libs,test}/**/*.ts"` | `tsc --noEmit` |
| Vite | `eslint .` | `tsc --noEmit` |
| Monorepo | `turbo lint` | `turbo typecheck` |

## Verify
- Exit code 0 for both commands
- No suppressed errors (no new `eslint-disable` or `@ts-ignore`)

## NEVER
- Ignore warnings in CI-critical paths
- Add blanket `eslint-disable` to files
- Skip typecheck because "lint passed"
- Treat warnings as acceptable long-term
