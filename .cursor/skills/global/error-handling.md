# Error Handling

## Purpose
CRITICAL. Every error must be caught, logged, and surfaced appropriately. No silent failures.

## Backend Rules

### HTTP Status Codes
| Code | Use When |
|------|----------|
| 400 | Invalid input / validation failure |
| 401 | Not authenticated |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, state conflict) |
| 422 | Semantically invalid (valid syntax, bad logic) |
| 500 | Unexpected server error |

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [{ "field": "email", "issue": "must not be empty" }]
  }
}
```

### Logging
- Log every error with: timestamp, request ID, user ID, error code, stack trace
- Use structured logging (JSON format)
- Include enough context to reproduce the issue

## Frontend Rules
- **Error boundaries**: wrap every page/route
- **API errors**: show toast notification with user-friendly message
- **Network failures**: show retry button
- **Broken components**: render fallback UI
- **Every data component** must handle: loading, error, empty states

## Database Rules
- Wrap multi-step operations in transactions
- Rollback on any failure within transaction
- Retry on deadlock (max 3 times with backoff)

## External API Rules
- Set timeout (default: 10s)
- Retry transient failures (max 3, with exponential backoff)
- Circuit breaker: after 5 consecutive failures, stop calling for 30s

## Steps
1. Identify all error scenarios for the feature
2. Implement proper status codes and error responses
3. Add error boundaries/toasts on frontend
4. Add structured logging on backend
5. Test each error path (force errors in tests)

## Verify
- Every endpoint returns correct status codes for error cases
- Frontend shows appropriate UI for every error type
- Logs contain enough context to debug issues
- No unhandled promise rejections or uncaught exceptions

## NEVER
- Expose stack traces to the client
- Swallow errors silently (`catch {}` with no handling)
- Return 200 for error responses
- Show raw error messages to users
- Log sensitive data (passwords, tokens) in error logs
- Use generic "Something went wrong" without logging details
