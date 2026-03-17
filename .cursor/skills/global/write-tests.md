# Write Tests

## Purpose
CRITICAL. Every feature must have tests. Find edge cases systematically. Never ship untested code.

## Coverage Rules
| Code Type | Required Tests |
|-----------|---------------|
| Service method | Unit test |
| API endpoint | E2E test |
| Business logic | Unit + edge case tests |
| Utility function | Unit test with boundary values |
| UI component | Render + interaction test |
| Auth flow | E2E + permission matrix |

## Edge Case Framework
Always test these categories:

**Boundary Values**
- `0`, `-1`, `MAX_INT`, `null`, `undefined`, `""`
- Empty array `[]`, single item `[x]`, max items
- String: empty, 1 char, max length, special chars, unicode

**State Transitions**
- Every valid state pair (e.g., pending→active, active→cancelled)
- Invalid transitions (expect rejection)

**Concurrency**
- 2 simultaneous requests to same resource
- Double-submit (rapid duplicate requests)

**Permissions (role × endpoint matrix)**
- Every role accessing every endpoint
- Expect 403 for unauthorized combinations

**Time Edge Cases**
- Timezone differences (UTC vs local)
- Midnight boundary, DST transitions
- Expiry at exact cutoff time

## Steps
1. Identify what's new/changed
2. Write happy path test first
3. Apply edge case framework above
4. Run tests: `npm test`
5. All must pass — if fail, fix CODE not test (unless test is wrong)
6. Max 5 fix attempts per failing test
7. Update test count in `PROGRESS.md`

## Test File Naming
- Unit: `*.spec.ts` or `*.test.ts` next to source
- E2E: `*.e2e-spec.ts` in `test/` directory
- Follow existing project conventions

## Verify
- All tests pass
- Coverage increased or maintained
- Edge cases from framework above are covered
- Test count updated in PROGRESS.md

## NEVER
- Ship code without tests
- Delete failing tests to make suite pass
- Write tests that don't assert anything meaningful
- Mock everything (test real behavior where possible)
- Skip edge cases because "happy path works"
- Write tests after the fact without understanding the code
