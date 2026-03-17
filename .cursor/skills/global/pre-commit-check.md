# Pre-Commit Check

## Purpose
Quality gate that MUST pass before any commit. Run all checks and report status.

## Steps
1. **Lint**: run project linter
2. **Typecheck**: run `tsc --noEmit` (or equivalent)
3. **Tests**: run full test suite
4. **Build**: run build to catch compilation errors
5. **Security scan**: check staged files for secrets

## Security Scan — Check Staged Files
```bash
git diff --cached --name-only | xargs grep -l -E \
  '(API_KEY|SECRET|PASSWORD|TOKEN|PRIVATE_KEY|aws_access_key)' || echo "clean"
```

Also reject if staged:
- `.env`, `.env.*` files
- `*.pem`, `*.key` files
- Files containing hardcoded credentials

## Output Format
```
─── Pre-Commit Quality Gate ───
✅ Lint         — 0 errors
✅ Typecheck    — 0 errors
❌ Tests        — 2 failing
✅ Build        — success
✅ Security     — no secrets found
────────────────────────────────
RESULT: ❌ BLOCKED (tests failing)
```

## Decision Logic
- ALL checks ✅ → `RESULT: ✅ READY TO COMMIT`
- ANY check ❌ → `RESULT: ❌ BLOCKED (reason)`
- If lint/type errors → invoke `auto-fix` skill, then recheck
- If tests fail → fix code (not tests), then recheck
- If security issue → remove secret, use env variable instead

## Verify
- Run gate again after fixes — must show all ✅
- No false passes: every check must actually execute

## NEVER
- Skip a check because "it was passing before"
- Mark READY when any check is failing
- Ignore security scan results
- Commit with BLOCKED status
