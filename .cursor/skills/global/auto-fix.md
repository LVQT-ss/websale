# Auto-Fix

## Purpose
Automatically fix lint and type errors. Max 3 attempts. Escalate if unfixable.

## Scope — What to Fix
- Import errors (missing, wrong path, unused)
- Type mismatches (wrong type, missing type annotation)
- Formatting issues (whitespace, semicolons, quotes)
- Unused variables/imports
- Simple ESLint auto-fixable rules

## Scope — What NOT to Fix
- Logic errors
- Test failures
- Runtime bugs
- Business logic issues
- Architectural problems

## Steps
1. Run lint: `npm run lint 2>&1` — capture errors
2. Attempt auto-fix: `npm run lint -- --fix`
3. Run typecheck: `tsc --noEmit 2>&1` — capture errors
4. For type errors: fix manually (add types, fix imports)
5. Re-run both checks
6. If errors remain → repeat (max 3 total attempts)

## Output Format
```
─── Auto-Fix Attempt 1/3 ───
Lint errors found: 5
Auto-fixed: 4
Remaining: 1 (no-explicit-any in src/utils.ts:42)
Type errors found: 2
Fixed: 2 (added missing import, fixed return type)
─── Recheck ───
Lint: ✅ 0 errors
Typecheck: ✅ 0 errors
RESULT: ✅ ALL FIXED
```

## Escalation
After 3 failed attempts:
```
RESULT: ❌ CANNOT AUTO-FIX
Remaining errors:
  - src/utils.ts:42 — logic error requires human decision
ACTION: Stopping. Asking user for guidance.
```

## Verify
- Zero lint errors after fix
- Zero type errors after fix
- No behavior changes introduced (only style/type fixes)

## NEVER
- Fix logic errors automatically
- Suppress errors with `@ts-ignore` or `eslint-disable`
- Change test expectations to make tests pass
- Make more than 3 attempts
- Fix errors by deleting code
