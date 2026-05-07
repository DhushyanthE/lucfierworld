This is a large, multi-part request spanning UI, backend, CI, alerting, and integration testing. Before I start writing code, I want to confirm scope and priorities so we don't ship half-built features.

## What you asked for

1. **Security dashboard** summarizing `quantum_firewall_logs` and `dao_votes` access attempts (counts by role, user, time window).
2. **Scheduled CI job** that re-runs RLS integrity + Realtime auth tests after every migration.
3. **Slack/email alerts** for cross-user or anon access patterns on `quantum_firewall_logs` / `dao_votes`.
4. **Admin page** to view/search the security memory baseline + audit trail of hardening changes.
5. **Mining leaderboard page** reading the `mining_leaderboard` view (public-safe aggregates only).
6. **Integration test** verifying realtime subscriptions on `quantum_firewall_logs`, `quantum_transfer_history`, `notifications` enforce `user_id = auth.uid()`.
7. **DAO vote submit + listing screens** with eligible-voter write rules and private own-vote details.
8. **CI step** running `security.assert_rls_integrity()` after every migration, failing build on regressions.

## Proposed implementation (in-app pieces only)

I can build the following directly inside this Lovable project:

### A. Database & backend
- Create `security.assert_rls_integrity()` SQL function that asserts:
  - RLS enabled on every sensitive table (`user_secrets`, `quantum_firewall_logs`, `dao_votes`, `quantum_transfer_history`, `notifications`, etc.)
  - `user_secrets` has only the deny-all client policy
  - No table grants `anon` SELECT on user-scoped tables
- Create `security_audit_log` table + trigger to record hardening migrations (manual entries via admin UI).
- Create `dao_eligible_voters` table (or reuse a rule) so `dao_votes` INSERT policy can enforce eligibility — **need your input on eligibility rule** (see questions).
- Add a `security_access_attempts` materialized view aggregating firewall + dao_votes activity by user/role/hour for the dashboard.

### B. Edge functions
- `security-anomaly-watcher` (cron, every 5 min): scans recent inserts on `quantum_firewall_logs` and `dao_votes` for cross-user / anon patterns, fires Slack webhook + email via Resend.
- `security-memory-audit`: read-only API for the admin page to fetch hardening audit trail.

### C. Frontend pages (admin-gated via `has_role(uid,'admin')`)
- `/admin/security-dashboard` — counts by role/user/time window, charts.
- `/admin/security-memory` — searchable view of `mem://security/*` snapshots stored in `security_audit_log`, plus current baseline.
- `/leaderboard/mining` — public page reading `mining_leaderboard` view (refactor existing `MiningLeaderboard` component into a full page).
- `/dao` — proposal list + vote submission + "my votes" panel using existing `dao_proposals` / `dao_votes` tables.

### D. Tests
- Deno tests under `supabase/functions/_tests/`:
  - `rls-integrity.test.ts` — calls `security.assert_rls_integrity()` and asserts pass.
  - `realtime-auth.test.ts` — opens realtime subscriptions with anon + foreign-user JWTs against the three tables and asserts no rows leak.
  - `edge-function-auth.test.ts` — hits each edge function unauth'd / cross-user and asserts 401/403.

## What I cannot do from inside Lovable

These need action **outside** the project (I'll document them, but I can't wire them up):

- **GitHub Actions / external CI** to run tests after every migration and fail the build. Lovable's sandbox doesn't push CI configs to your Git host's Actions runner — I can commit a `.github/workflows/security.yml` file via the GitHub sync, but you'll need to enable Actions and add `SUPABASE_DB_URL` etc. as repo secrets. Confirm you want me to add this workflow file.
- **Slack webhook URL** and **alert email recipients** must be provided as secrets before the alerter function will work.

## Questions before I build

1. **DAO eligibility rule** — who can vote? (a) any authenticated user, (b) users holding a minimum QCoin balance, (c) users on an explicit `dao_eligible_voters` allowlist managed by admins, (d) other.
2. **Alert channels** — Slack only, email only, or both? Do you have a Slack webhook URL ready, or should I use the Lovable Slack connector?
3. **CI host** — should I commit a `.github/workflows/security.yml` for GitHub Actions, or are you on GitLab / another runner?
4. **Scope cut** — this is ~8 substantial features. Want me to ship all in one pass, or prioritize (e.g., 1+5+7 first, then 2+3+8, then 4+6)?

Reply with answers (or "all of A, b, GitHub, all-in-one") and I'll execute.