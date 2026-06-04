import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with, x-csrf-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const csvCell = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  // Mitigate CSV/spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replaceAll('"', '""')}"`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Defense-in-depth CSRF check (same contract as replay endpoint).
  if (req.headers.get("x-requested-with") !== "XMLHttpRequest") {
    return json({ error: "Missing CSRF header" }, 403);
  }
  const csrfToken = req.headers.get("x-csrf-token");
  if (!csrfToken || csrfToken.length < 16 || csrfToken.length > 256) {
    return json({ error: "Invalid CSRF token" }, 403);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Server misconfigured" }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(
    authHeader.slice(7),
  );
  const claims = claimsData?.claims as Record<string, unknown> | undefined;
  if (claimsErr || !claims?.sub) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
    _user_id: claims.sub,
    _role: "admin",
  });
  if (roleErr || isAdmin !== true) return json({ error: "Forbidden" }, 403);

  let body: { from?: string; to?: string } = {};
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }

  const isoRe = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?Z?)?$/;
  if (!body.from || !body.to || !isoRe.test(body.from) || !isoRe.test(body.to)) {
    return json({ error: "from/to must be ISO 8601" }, 400);
  }
  const fromDate = new Date(body.from);
  const toDate = new Date(body.to);
  if (isNaN(+fromDate) || isNaN(+toDate) || fromDate > toDate) {
    return json({ error: "Invalid date range" }, 400);
  }
  const spanDays = (+toDate - +fromDate) / (24 * 3600_000);
  if (spanDays > 92) return json({ error: "Range cannot exceed 92 days" }, 400);

  const { data: rows, error } = await admin
    .from("stripe_webhook_replay_audit")
    .select("id, admin_user_id, event_id, status, error, ip_hash, user_agent, origin, created_at")
    .gte("created_at", fromDate.toISOString())
    .lte("created_at", toDate.toISOString())
    .order("created_at", { ascending: false })
    .limit(10_000);

  if (error) return json({ error: error.message }, 500);

  const header = [
    "id", "created_at", "admin_user_id", "event_id", "status",
    "error", "origin", "ip_hash", "user_agent",
  ];
  const lines = [header.join(",")];
  for (const r of rows ?? []) {
    lines.push([
      csvCell(r.id), csvCell(r.created_at), csvCell(r.admin_user_id),
      csvCell(r.event_id), csvCell(r.status), csvCell(r.error),
      csvCell(r.origin), csvCell(r.ip_hash), csvCell(r.user_agent),
    ].join(","));
  }
  const csv = lines.join("\n");

  const filename = `stripe-replay-audit_${body.from}_to_${body.to}.csv`.replace(/[^\w.\-]+/g, "_");

  return new Response(csv, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Row-Count": String(rows?.length ?? 0),
    },
  });
});
