# Safe Commit

## Purpose
Ensure every commit is clean, tested, and follows conventions.

## Pre-Commit Checklist
- [ ] Lint passes (`npm run lint` / `pnpm lint`)
- [ ] Typecheck passes (`tsc --noEmit`)
- [ ] Tests pass (`npm test`)
- [ ] No `.env` files staged
- [ ] No secrets/API keys in diff
- [ ] No `console.log` statements (use proper logger)
- [ ] Commit message follows conventional format

## Commit Message Format
```
type(scope): description

types: feat, fix, refactor, test, docs, chore, perf, ci
scope: module or area affected
description: imperative mood, lowercase, no period
```

Examples:
- `feat(auth): add JWT refresh token rotation`
- `fix(api): handle null response from payment gateway`
- `test(users): add edge cases for email validation`

## Steps
1. **Stage files**: `git add <specific-files>` (never `git add .` blindly)
2. **Review diff**: `git diff --cached` — read every line
3. **Run quality gate**: invoke `pre-commit-check` skill
4. **Commit**: `git commit -m "type(scope): description"`
5. **Push**: `git push origin <branch-name>`

## Verify
- `git log -1` shows correct message format
- `git diff HEAD~1 --stat` shows only intended files
- CI pipeline passes (if available)

## NEVER
- Force push (`--force` or `-f`)
- Push directly to `main` or `master`
- Commit when any check fails
- Commit generated files (`node_modules`, `dist`, `.next`)
- Use vague messages like "fix stuff" or "update"
- Batch unrelated changes in one commit
