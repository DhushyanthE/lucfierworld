# Security Changelog — 2026-06-11
## Analytics ingestion hardening (RLS + `track-analytics`)

### Summary
Closed a scanner-reported finding (`analytics_events_anon_insert_ip_harvesting`)
that allowed anonymous clients to write arbitrary `ip_address`, `user_agent`,
`referrer`, and `page_url` values directly into `public.analytics_events` via
the Supabase Data API. After this change, **all anonymous ingestion goes
through the trusted `track-analytics` edge function**, which derives sensitive
fields from request headers.

### Threat model
| Actor | Capability before fix | Capability after fix |
|---|---|---|
| Unauthenticated client | Could `INSERT` arbitrary rows with `user_id IS NULL` and forge `ip_address`, `user_agent`, `referrer` directly via PostgREST (subject only to a 100/min rate limit). | Cannot `INSERT` directly. May only call the edge function, which validates the payload and overrides trusted fields. |
| Authenticated user | Could insert rows with `user_id = auth.uid()` (unchanged). | Same — explicitly allowed by the new policy. |
| Service role / edge fn | Bypasses RLS (unchanged). | Same — used by `track-analytics` for the trusted insert path. |

### What changed

#### 1. RLS policy on `public.analytics_events`
- **Dropped:** `Users can insert analytics events with rate limit` — previously
  permitted `auth.uid() IS NULL AND user_id IS NULL` inserts.
- **Created:** `Authenticated users can insert their own analytics events`
  (role: `authenticated`), which enforces:
  - `auth.uid() IS NOT NULL`
  - `auth.uid() = user_id`
  - `public.check_analytics_rate_limit(...)` (existing per-user limit).
- Net effect: PostgREST returns `42501 / new row violates row-level security
  policy` for any anon insert attempt.

#### 2. `supabase/functions/track-analytics/index.ts`
- Introduced a **service-role client** (`SUPABASE_SERVICE_ROLE_KEY`) for the
  actual write. The user-scoped client is now used only to identify the caller
  via `auth.getUser()`.
- `ip_address` is derived from `X-Forwarded-For` (first hop, trimmed). Any
  client-supplied `ip_address` is ignored — the field is no longer accepted
  from the request body.
- `user_agent` is derived from the `User-Agent` request header, clamped to
  512 chars. Any client-supplied `user_agent` in the JSON body is dropped.
- `analytics_sessions` writes were migrated to the same service client for
  consistency.

### Verification
- Migration applied and policy confirmed via `pg_policy` introspection.
- New Deno integration test:
  `supabase/functions/_tests/analytics_anon_insert_test.ts`
  - Asserts direct anon `INSERT` is rejected.
  - Asserts the edge function ignores forged `user_agent` in the body.
- Existing scanner finding `analytics_events_anon_insert_ip_harvesting`
  marked **fixed**.

### Residual risk / accepted
- Anonymous rows remain unreadable to the inserting session (only admins can
  read `user_id IS NULL` rows). This is intentional and noted in
  `@security-memory`.
- The in-memory rate limiter inside the edge function is per-isolate and
  best-effort; the authoritative limit is the DB-side `check_analytics_rate_limit`.

### Rollback
Re-applying the previous `INSERT` policy would restore the vulnerability; do
not do this. If anonymous direct inserts are ever required again, route them
through a dedicated edge function instead.
