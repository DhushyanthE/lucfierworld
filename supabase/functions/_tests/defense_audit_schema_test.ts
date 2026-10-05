import { assert } from "jsr:@std/assert@1";

Deno.test("defense audit migration preserves fail-closed invariants", async () => {
  const sql = await Deno.readTextFile(new URL("../../migrations/20261003183000_defense_audit_events.sql", import.meta.url));
  assert(sql.includes("enable row level security"));
  assert(sql.includes("auth.uid() = user_id"));
  assert(sql.includes("human_approval_required = true"));
  assert(sql.includes("executed = false"));
  assert(!sql.includes("for update"));
  assert(!sql.includes("for delete"));
  assert(sql.includes("supabase_realtime add table"));
});


Deno.test("atomic audit migration serializes per-user chain appends", async () => {
  const sql = await Deno.readTextFile(new URL("../../migrations/20261004040000_atomic_defense_audit.sql", import.meta.url));
  assert(sql.includes("pg_advisory_xact_lock"));
  assert(sql.includes("auth.uid()"));
  assert(sql.includes("audit head conflict"));
  assert(sql.includes("security invoker"));
  assert(sql.includes("grant execute"));
});
