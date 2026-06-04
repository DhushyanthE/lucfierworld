# Stripe Webhook Replay — Admin API

Endpoint that lets an admin re-process a previously received Stripe event from
`stripe_webhook_events`. Hardened with strict JWT validation, role check,
per-admin + per-event rate limits, and CSRF defenses.

- **URL** (Lovable Cloud): `POST {SUPABASE_URL}/functions/v1/stripe-webhook-replay`
- **Audit table**: `public.stripe_webhook_replay_audit` (admins-only SELECT)
- **Audit CSV export**: `POST /functions/v1/stripe-replay-audit-export`

## Required request headers

| Header               | Required        | Value                                                      | Why |
|----------------------|-----------------|------------------------------------------------------------|-----|
| `Authorization`      | yes             | `Bearer <user JWT>` from a Supabase admin session          | JWT signature + `exp`/`iat` are verified server-side via `auth.getClaims`. The `sub` must have the `admin` role in `user_roles`. |
| `apikey`             | yes             | Supabase publishable/anon key                              | Required by the Edge Functions gateway. |
| `Content-Type`       | yes             | `application/json`                                         | Body parser expectation. |
| `X-Requested-With`   | yes             | `XMLHttpRequest` (exact, case-insensitive)                 | CSRF defense — this is a non-CORS-safelisted header browsers cannot send from a cross-site `<form>` without a preflight. |
| `X-CSRF-Token`       | yes             | Random opaque token, 16–256 chars                          | Per-request CSRF nonce — defense in depth alongside `X-Requested-With`. |
| `Origin`             | yes (in browser) | Must be present in `STRIPE_REPLAY_ALLOWED_ORIGINS` if set | Allowlist enforcement. Browsers always send this for cross-origin POSTs. |

Notes:
- Tokens are validated through `auth.getClaims(token)`. The claim set must have
  `aud === "authenticated"`, `role === "authenticated"`, a future `exp`, and a
  non-future `iat` (60 s clock skew allowed).
- If `STRIPE_REPLAY_ALLOWED_ORIGINS` is unset, the origin allowlist is skipped
  (intended for server-to-server testing only — set it in production).

## Request body

```json
{ "event_id": "evt_1NcXXXXXXXXXXXXX" }
```

`event_id` must match `^evt_[A-Za-z0-9_]{8,128}$` and must exist in
`stripe_webhook_events`.

## Rate limits

Enforced by the SECURITY DEFINER function `public.check_stripe_replay_rate_limit`:

- 5 replays per admin per minute
- 30 replays per admin per hour
- 30 s cooldown per `event_id` across all admins

Exceeding any limit returns `429` with a `reason` of
`rate_limit_minute` / `rate_limit_hour` / `rate_limit_event_cooldown`.

## Response

Success:
```json
{ "replayed": true, "status": "replayed:succeeded", "error": null }
```

Denial:
```json
{ "error": "Forbidden", "reason": "role_not_admin" }
```

Denial reasons (`reason` field):

| Reason                       | HTTP | Cause |
|------------------------------|------|-------|
| `method_not_allowed`         | 405  | Non-POST request |
| `csrf_xhr_missing`           | 403  | `X-Requested-With` not `XMLHttpRequest` |
| `cors_origin_blocked`        | 403  | `Origin` not in allowlist |
| `csrf_token_missing`         | 403  | `X-CSRF-Token` missing or wrong length |
| `auth_missing`               | 401  | No `Authorization: Bearer …` |
| `jwt_invalid`                | 401  | Signature/parse error, or `iat` in the future |
| `jwt_expired`                | 401  | `exp` in the past |
| `jwt_bad_audience`           | 401  | `aud`/`role` claim not `authenticated` |
| `role_not_admin`             | 403  | User has no `admin` row in `user_roles` |
| `body_invalid`               | 400  | Body is not valid JSON |
| `event_id_invalid`           | 400  | `event_id` fails regex |
| `rate_limit_minute`          | 429  | >5 replays in last minute |
| `rate_limit_hour`            | 429  | >30 replays in last hour |
| `rate_limit_event_cooldown`  | 429  | Same `event_id` replayed within 30 s |
| `event_not_found`            | 404  | No stored webhook with that `event_id` |

Every denial inserts a `denied:<reason>` row into
`stripe_webhook_replay_audit` and severe denials (auth/CSRF/CORS/rate-limit
violations) emit a deduplicated Slack notification to `SLACK_WEBHOOK_URL`.

## Example: successful replay

```bash
curl -sS -X POST "$SUPABASE_URL/functions/v1/stripe-webhook-replay" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Origin: https://app.example.com" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "X-CSRF-Token: $(openssl rand -hex 24)" \
  -d '{"event_id":"evt_1NcAaBbCcDdEeFfGg"}'
```

## Example: a denial you should see (missing CSRF header)

```bash
curl -i -X POST "$SUPABASE_URL/functions/v1/stripe-webhook-replay" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "Origin: https://app.example.com" \
  -d '{"event_id":"evt_1NcAaBbCcDdEeFfGg"}'

# HTTP/1.1 403 Forbidden
# {"error":"CSRF protection required","reason":"csrf_xhr_missing"}
```

## CSV export of the audit log

```bash
curl -sS -X POST "$SUPABASE_URL/functions/v1/stripe-replay-audit-export" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "X-CSRF-Token: $(openssl rand -hex 24)" \
  -d '{"from":"2026-06-01T00:00:00Z","to":"2026-06-04T23:59:59Z"}' \
  -o stripe-replay-audit.csv
```

Range is capped at 92 days and 10 000 rows per call. The response header
`X-Row-Count` reports the number of rows in the file.

## Running the tests

```bash
deno test --allow-net --allow-env \
  supabase/functions/stripe-webhook-replay/index_test.ts
```

The test file injects a fake Supabase client to cover every denial path
(invalid role, expired JWT, missing CSRF, rate-limit breaches, event-not-found,
Slack notification on severe denials) without hitting the network.
