# Database Migration

## Purpose
Safely modify database schema using Prisma migrations.

## Schema Migration Steps

### 1. Edit Schema
```prisma
// Backend/prisma/schema.prisma
model NewModel {
  id        String   @id @default(cuid())
  name      String
  status    Status   @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  createdBy   User   @relation(fields: [createdById], references: [id])
  createdById String
}

enum Status {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### 2. Generate Migration
```bash
cd Backend
npx prisma migrate dev --name add_new_model
```

### 3. Regenerate Client
```bash
npx prisma generate
```

### 4. Update Seed
Add seed data for new model (see `seed-data` skill). Must include:
- 1 record per enum value
- Edge case records

### 5. Verify
```bash
npx prisma studio                    # visual check — table exists, columns correct
npx prisma migrate reset --force     # full reset + seed
npm run build                        # backend compiles with new types
npm run test                         # existing tests pass
```

## Data Migration (runtime data changes)
For data-only changes (backfill, transform, cleanup):
```bash
# Create script
touch Backend/scripts/migrate-{description}.ts

# Run with ts-node
npx ts-node Backend/scripts/migrate-{description}.ts

# Test on dev DB FIRST, then production
```

## Common Patterns
| Change | Command |
|--------|---------|
| Add column (optional) | Add field with `?` → `migrate dev` |
| Add column (required) | Add with `@default(value)` → `migrate dev` |
| Rename column | Add new → backfill → remove old (3 migrations) |
| Add relation | Add both FK field + relation decorator |
| Add enum value | Add to enum → `migrate dev` |

## Verify
- `npx prisma migrate status` shows no pending migrations
- `npm run build` succeeds
- `npx prisma migrate reset --force` runs clean (seed included)

## NEVER
- Edit or delete existing migration SQL files
- Use `prisma db push` on production
- Add required column without default on table with data
- Rename columns in single migration (use 3-step process)
- Skip updating seed data after schema change
- Run `migrate dev` on production (use `migrate deploy`)
