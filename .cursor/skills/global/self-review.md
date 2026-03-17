# Self-Review

## Purpose
CRITICAL. Before every commit, review your own code as a skeptical senior engineer would.

## Review Checklist

Run through EVERY item. Mark PASS or FOUND+FIXED.

### Performance
- [ ] Any N+1 queries? (fetching in loop instead of batch)
- [ ] Any unbounded queries? (missing LIMIT/pagination)
- [ ] Any unnecessary data fetching? (SELECT * vs specific fields)

### Security
- [ ] Any SQL injection vectors? (raw queries with user input)
- [ ] Any hardcoded values? (URLs, secrets, magic numbers → use config/constants)
- [ ] Any sensitive data leaked in responses? (passwords, tokens, internal IDs)
- [ ] Any error messages exposing internal info? (stack traces, DB structure)
- [ ] Any missing input validation?

### Reliability
- [ ] Any race conditions? (concurrent access to shared state)
- [ ] Any missing error handling? (unguarded async, missing try/catch)
- [ ] Any missing null checks? (optional chaining where needed)

### Code Quality
- [ ] Any unused imports/variables?
- [ ] Any TODO/FIXME left behind?
- [ ] Any console.log statements? (use proper logger)
- [ ] Any commented-out code?
- [ ] Any duplicated logic? (extract to utility)

## Steps
1. `git diff --cached` — read every changed line
2. Run through checklist above for each file
3. For each FOUND item: fix immediately
4. Re-run diff to verify fixes
5. Proceed to commit only when all items PASS

## Output Format
```
─── Self-Review ───
N+1 queries:       PASS
SQL injection:      PASS
Hardcoded values:   FOUND+FIXED (moved API URL to config)
Sensitive data:     PASS
Race conditions:    PASS
Error handling:     FOUND+FIXED (added try/catch to payment flow)
Unused imports:     FOUND+FIXED (removed 3 unused imports)
TODO/FIXME:         PASS
─── RESULT: ✅ READY ───
```

## Verify
- Every checklist item addressed
- All FOUND items were FIXED (not just noted)
- Diff is clean after fixes

## NEVER
- Skip self-review because "it's a small change"
- Mark PASS without actually checking
- Leave FOUND items unfixed
- Commit with known issues "to fix later"
