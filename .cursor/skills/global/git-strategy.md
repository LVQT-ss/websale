# Git Strategy

## Purpose
Consistent branching, naming, and commit practices across the project.

## Branch Naming
| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/{name}` | `feature/user-auth` |
| Bug fix | `fix/{name}` | `fix/login-redirect` |
| Hotfix | `hotfix/{name}` | `hotfix/payment-crash` |
| Chore | `chore/{name}` | `chore/update-deps` |

## Branch From
- Feature → branch from `main`
- Fix → branch from `main`
- Hotfix → branch from `main` (deploy independently)

## Commit Granularity
**1 logical change = 1 commit**

Good:
- `feat(auth): add login endpoint`
- `feat(auth): add login page UI`
- `test(auth): add login e2e tests`

Bad:
- One commit per file (too granular)
- One giant commit for entire feature (too broad)
- Mix of unrelated changes in one commit

## When to Commit
- After completing a sub-task that passes quality gate
- After writing tests for a feature
- After fixing a bug (with test proving the fix)
- After refactoring (with tests proving no regression)

## Merge Strategy
- **Features**: squash merge into `main` (clean history)
- **Hotfixes**: regular merge (preserve commit trail)

## Steps for New Feature
1. `git checkout main && git pull`
2. `git checkout -b feature/{name}`
3. Work in small commits (invoke `safe-commit` skill)
4. Push branch, open PR
5. Squash merge after review

## Verify
- Branch name follows convention
- Each commit has one logical purpose
- No unrelated changes mixed in
- All commits pass quality gate

## NEVER
- Commit directly to `main`
- Force push to shared branches
- Rebase shared branches (rebase only local/personal branches)
- Leave uncommitted work when switching tasks
- Use merge commits on feature branches (rebase instead)
