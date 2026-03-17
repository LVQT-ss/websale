# Refactoring

## Purpose
Keep code clean and maintainable. Refactor systematically with safety nets.

## Triggers — When to Refactor
| Smell | Threshold | Action |
|-------|-----------|--------|
| Large file | > 300 lines | Split into modules |
| Long function | > 50 lines | Extract sub-functions |
| Copy-paste | > 2 occurrences | Extract shared utility |
| Too many dependencies | > 10 imports | Split module |
| Deep nesting | > 3 levels | Extract early returns / helpers |
| God class/module | Does everything | Split by responsibility |

## Steps
1. **Identify** the code smell and scope of refactoring
2. **Ensure tests exist** — if no tests cover the code, write them FIRST
3. **Run tests** — establish green baseline
4. **Refactor** — make structural changes without changing behavior
5. **Run tests** — must still pass (same count, same results)
6. **Verify** — behavior is identical, code is cleaner
7. **Commit** — separate commit for refactoring only

## Common Refactoring Patterns
- **Extract function**: pull logic into named, testable function
- **Extract module**: move related functions to dedicated file
- **Replace magic numbers**: use named constants
- **Simplify conditionals**: extract to descriptive boolean variables
- **Remove dead code**: delete unused functions/imports/variables
- **Introduce interface**: decouple dependencies

## Verify
- All tests pass before AND after refactoring
- No behavior changes (same inputs → same outputs)
- Code is measurably cleaner (fewer lines, lower complexity)
- Commit contains ONLY refactoring changes

## NEVER
- Refactor and add features in the same commit
- Refactor without tests (you need a safety net)
- Change behavior during refactoring (that's a feature/fix, not a refactor)
- Refactor code you don't understand yet
- Do large refactors without breaking into small steps
