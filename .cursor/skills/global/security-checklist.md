# Security Checklist

## Purpose
CRITICAL. Run before EVERY commit that touches auth, payment, or user data.

## Checklist

### Input Validation
- [ ] All DTOs have validation decorators (class-validator or equivalent)
- [ ] String fields have max length
- [ ] Number fields have min/max range
- [ ] Email fields validated with proper regex
- [ ] No user input passed directly to queries

### SQL Injection
- [ ] Using ORM parameterized queries (Prisma, TypeORM, etc.)
- [ ] NO raw SQL with string concatenation of user input
- [ ] `$queryRaw` uses `Prisma.sql` tagged template (if Prisma)

### XSS
- [ ] HTML output sanitized (DOMPurify or equivalent)
- [ ] React: no `dangerouslySetInnerHTML` with user content
- [ ] API responses have `Content-Type: application/json`

### CORS
- [ ] Specific origins whitelisted (not `*` in production)
- [ ] Credentials mode matches CORS config

### Rate Limiting
- [ ] Auth endpoints: strict limit (5 req/min)
- [ ] Payment endpoints: strict limit (10 req/min)
- [ ] General API: reasonable limit (100 req/min)
- [ ] Rate limit by IP + user ID combination

### File Upload
- [ ] File type validated (whitelist extensions + MIME type)
- [ ] Max file size enforced (≤ 5MB default)
- [ ] Files stored outside webroot
- [ ] Filenames sanitized (no path traversal)

### Authentication
- [ ] JWT expiry set (access: 15min, refresh: 7d)
- [ ] Refresh token rotation enabled
- [ ] Cookies: `httpOnly`, `secure`, `sameSite`
- [ ] Session invalidation on password change

### Passwords
- [ ] Bcrypt with cost factor ≥ 10
- [ ] Minimum length ≥ 8 characters

### Data Exposure
- [ ] API responses exclude: `passwordHash`, `tokens`, `internalId`
- [ ] Use DTOs/serializers to control response shape
- [ ] Logs exclude sensitive fields

### RBAC
- [ ] Every endpoint has role guard
- [ ] Tested: wrong role → 403 Forbidden
- [ ] Resource ownership verified (user can only access own data)

## Steps
1. Identify which categories apply to current changes
2. Run through relevant checklist items
3. Fix any issues found
4. Document any security decisions in `DECISIONS.md`

## Verify
- All applicable checklist items pass
- No new `eslint-disable` for security rules
- Tested with unauthorized/malicious inputs

## NEVER
- Skip this checklist for "small" auth changes
- Use `*` for CORS origins in production
- Store passwords in plain text
- Trust client-side validation alone
- Expose internal error details to clients
