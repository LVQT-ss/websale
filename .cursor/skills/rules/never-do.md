# Universal NEVER Rules

These rules apply to ALL projects, ALL stacks, ALL situations. No exceptions.

## Git
- NEVER force push (`--force`, `-f`)
- NEVER push directly to `main` or `master`
- NEVER commit `.env` files or secrets
- NEVER commit `node_modules`, `dist`, `build`, `.next`
- NEVER edit or delete migration files after they've been applied

## Code Quality
- NEVER use `any` type (use `unknown` + type guard if truly dynamic)
- NEVER leave `console.log` in committed code (use a proper logger)
- NEVER commit commented-out code
- NEVER swallow errors silently (`catch {}` with no handling)
- NEVER return HTTP 200 for error responses

## Security
- NEVER expose stack traces to the client
- NEVER use raw SQL with user input (use parameterized queries)
- NEVER store passwords in plain text (use bcrypt, cost ≥ 10)
- NEVER hardcode API URLs or secrets (use environment variables)
- NEVER skip input validation ("the frontend validates it")
- NEVER trust client-side data without server-side validation
- NEVER log sensitive data (passwords, tokens, full credit card numbers)

## Data
- NEVER delete data without a soft-delete option (unless explicitly required)
- NEVER run destructive operations without a transaction
- NEVER modify production data manually

## Testing
- NEVER skip tests before committing
- NEVER delete failing tests to make the suite pass
- NEVER mark tests as `.skip` without a tracking issue

## Architecture
- NEVER import from a module's internal files (use its public API/index)
- NEVER create circular dependencies
- NEVER put business logic in controllers (use services)

## If You're Tempted to Break a Rule
1. STOP
2. Re-read the rule
3. Find an alternative approach that follows the rule
4. If truly impossible → document in `DECISIONS.md` with full reasoning
