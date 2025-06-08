# Effect RPC Middleware Error Handling Issue

This repository demonstrates a bug in Effect-TS RPC middleware where typed errors are not properly returned to the client, causing unhandled errors instead.

## Issue Reference

This is a reproduction case for: [Effect-TS/effect#5013](https://github.com/Effect-TS/effect/issues/5013)

## The Problem

When RPC middleware contains asynchronous operations (specifically `Effect.sleep`), typed errors thrown by the middleware are not properly propagated to the client. Instead of receiving the expected typed error, the client gets an unhandled `RequestError`.

## The Culprit

**Line 31 in `src/main.ts`** is the root cause:

```typescript
yield* Effect.sleep('1 second')
```

When this line is **removed**, the error handling works correctly and the typed error is properly returned to the client.

## Reproduction Steps

1. **With the bug (current state):**
   ```bash
   # Terminal 1: Start server
   bun src/main.ts
   
   # Terminal 2: Run client
   bun src/client.ts
   ```
   
   **Result:** Client receives `RequestError: Transport error` instead of the expected `MyError`.

2. **Without the bug:**
   - Comment out or remove line 31: `yield* Effect.sleep('1 second')`
   - Restart server and run client
   
   **Result:** Client properly receives the typed `MyError`.

## Technical Details

The issue occurs in the RPC middleware (`MyMiddleware`) when:
- The middleware performs asynchronous operations using `Effect.sleep`
- The middleware then fails with a typed error using `Effect.fail(new MyError())`
- The error is not properly serialized/transmitted to the client

## Files

- `src/main.ts` - Server setup with the problematic middleware
- `src/schema.ts` - RPC schema and error definitions  
- `src/client.ts` - Client that demonstrates the error

## Expected Behavior

The middleware should be able to:
1. Perform asynchronous operations (like `Effect.sleep`)
2. Fail with typed errors
3. Have those typed errors properly transmitted to the client

## Actual Behavior

When asynchronous operations are present in middleware, typed errors are not transmitted correctly, resulting in generic transport errors on the client side.

---

This reproduction case helps demonstrate the specific conditions under which the Effect RPC middleware error handling fails.
