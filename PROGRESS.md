# Project Progress

## Project: Flavor Template
## Current Phase: Initial Setup
**Last Updated:** 2026-03-17 03:45 by agent

---

## Completed

| # | Task | Date |
|---|------|------|
| 1 | Project scaffolding (NestJS Backend + Next.js Frontend) | 2026-03-16 |
| 2 | Database schema (Prisma) with all models and enums | 2026-03-16 |
| 3 | Initial migration (20260316185416_init) | 2026-03-16 |
| 4 | Seed data (users, templates, orders, reviews, settings) | 2026-03-16 |
| 5 | Fix CORS env var mismatch (CORS_ORIGIN -> ALLOWED_ORIGINS) | 2026-03-17 |
| 6 | Fix ESLint config (add argsIgnorePattern for unused vars) | 2026-03-17 |
| 7 | Fix floating promise warning in main.ts | 2026-03-17 |
| 8 | Add root .gitignore | 2026-03-17 |
| 9 | Make docker-compose ports configurable via env vars | 2026-03-17 |
| 10 | Verify Backend builds, runs, and serves API (8 templates, auth) | 2026-03-17 |
| 11 | Verify Frontend builds (29 routes, 0 errors) | 2026-03-17 |
| 12 | Backend + Frontend lint passes | 2026-03-17 |

---

## In Progress

None

---

## Next Up

1. Set up proper dev startup script — priority: medium
2. Add comprehensive API tests — priority: high
3. Configure R2/S3 storage for production — priority: medium
4. Configure SMTP email for production — priority: medium
5. Set up CI/CD pipeline — priority: medium

---

## Known Issues

| # | Issue | Severity | Workaround |
|---|-------|----------|------------|
| 1 | SMTP not configured — emails logged to console | low | Expected in dev mode |
| 2 | S3/R2 not configured — storage returns mock URLs | low | Expected in dev mode |
| 3 | @nestjs/mapped-types peer dep conflict with class-validator 0.15 | low | Use --legacy-peer-deps |

---

## Stats

| Metric | Count |
|--------|-------|
| API Endpoints | 30+ |
| Frontend Pages | 29 |
| Prisma Models | 11 |
| Seed Templates | 8 |
| Seed Users | 3 |

---

## Notes
- Docker is optional; PostgreSQL and Redis can run natively
- Backend port: 3001, Frontend port: 3000
- Use `npm ci --legacy-peer-deps` in Backend due to @nestjs/mapped-types peer dep conflict
- Seed accounts: admin@flavor.vn / Admin@123, staff@flavor.vn / Staff@123, khach@gmail.com / Customer@123
