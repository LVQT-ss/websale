# Run Tests

## Purpose
Run all test suites and report pass/fail status per check.

## Backend Tests

### Unit Tests (Jest)
```bash
cd Backend
npm run test
```

### E2E Tests (Jest + Supertest)
```bash
cd Backend
npm run test:e2e
```

### Type Check
```bash
cd Backend
npx tsc --noEmit
```

## Frontend Tests

### Type Check
```bash
cd Frontend
npx tsc --noEmit
```

### Build Check
```bash
cd Frontend
npm run build
```

### Lint
```bash
cd Frontend
npm run lint
```

## API Smoke Tests
Requires dev environment running (see `start-dev` skill).
```bash
# Health
curl -sf http://localhost:3001/health && echo "✅ Health" || echo "❌ Health"

# Login
TOKEN=$(curl -sf -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Test1234!"}' \
  | jq -r '.accessToken')
[ -n "$TOKEN" ] && echo "✅ Login" || echo "❌ Login"

# Authenticated endpoint
curl -sf http://localhost:3001/users/me \
  -H "Authorization: Bearer $TOKEN" && echo "✅ Auth endpoint" || echo "❌ Auth endpoint"
```

## Output Format
```
─── Test Results ───
✅ Backend unit tests     — 42 passed
✅ Backend e2e tests      — 12 passed
✅ Backend typecheck      — 0 errors
✅ Frontend typecheck     — 0 errors
✅ Frontend build         — success
✅ Frontend lint          — 0 warnings
✅ API health             — 200 OK
✅ API login              — token received
✅ API auth endpoint      — 200 OK
─────────────────────────
RESULT: ✅ ALL PASS (9/9)
```

## Verify
- All checks execute (no skipped)
- Zero errors across all checks
- API smoke tests use seeded test credentials

## NEVER
- Skip e2e tests because they're slow
- Mark passing when any check fails
- Use production credentials in smoke tests
- Run smoke tests against production API
