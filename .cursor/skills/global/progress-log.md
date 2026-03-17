# Progress Log

## Purpose
CRITICAL. Track project progress so any agent (or human) can pick up where the last left off.

## When to Update
- After EVERY completed step or sub-task
- After every commit
- When discovering a new issue
- When changing plans or priorities

## File Location
`PROGRESS.md` in project root. Create from `global/templates/PROGRESS.md.template` if missing.

## Format
```markdown
# Project Progress

## Current Phase: [phase name]
Last Updated: YYYY-MM-DD HH:MM by [agent/human]

## ✅ Completed
- [task description] (commit: abc1234)
- [task description] (commit: def5678)

## 🔄 In Progress
- [task description]
  - [x] Sub-task done
  - [ ] Sub-task pending

## 📋 Next Up
- [task 1]
- [task 2]

## ⚠️ Known Issues
- [issue description] — [workaround if any]

## 📊 Stats
- Commits: N
- API Endpoints: N
- Pages/Components: N
- Tests: N (passing: N, failing: N)
- Coverage: N%
```

## Steps for Updating
1. Read current `PROGRESS.md`
2. Move completed items from 🔄 to ✅ (add commit hash)
3. Update 🔄 with current work and sub-task status
4. Update 📋 if priorities changed
5. Add any new ⚠️ issues discovered
6. Update 📊 stats
7. Update timestamp

## Steps for New Agent Starting
1. Read `PROGRESS.md` FIRST — before any code
2. Read `DECISIONS.md` for context on past choices
3. Check ⚠️ Known Issues for gotchas
4. Resume from 🔄 In Progress or pick from 📋 Next Up

## Verify
- File is up to date with latest commit
- No stale items in 🔄 (everything either ✅ or still active)
- Stats match reality

## NEVER
- Start working without reading PROGRESS.md
- Leave PROGRESS.md outdated after a commit
- Delete history — only append/move items
- Skip the commit hash on completed items
