import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-requested-with, x-csrf-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "x-row-count, x-sort-by, x-sort-order",
};

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const csvCell = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  const s = typeof v === "string" ? v : JSON.stringify(v);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replaceAll('"', '""')}"`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

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

  let body: {
    from?: string; to?: string;
    denial_reason?: string; statuses?: string[];
    sort_by?: string; order?: string;
    page?: number; page_size?: number;
    only_denied?: boolean;
  } = {};
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

  const reasonRe = /^[a-z0-9_:]{1,64}$/;
  const denialReason = body.denial_reason && reasonRe.test(body.denial_reason) ? body.denial_reason : null;
  const statuses = Array.isArray(body.statuses)
    ? body.statuses.filter((s) => typeof s === "string" && reasonRe.test(s)).slice(0, 32)
    : [];

  // Whitelist sort + pagination so the CSV mirrors the UI exactly.
  const allowedSort = new Set(["created_at", "status", "event_id", "admin_user_id"]);
  const sortBy = body.sort_by && allowedSort.has(body.sort_by) ? body.sort_by : "created_at";
  const ascending = String(body.order ?? "desc").toLowerCase() === "asc";
  const page = Number.isInteger(body.page) && (body.page as number) >= 0 ? (body.page as number) : null;
  const pageSize = Number.isInteger(body.page_size) && (body.page_size as number) > 0 && (body.page_size as number) <= 1000
    ? (body.page_size as number) : null;
  const onlyDenied = body.only_denied !== false; // default true: matches denied-attempts table view

  let q = admin
    .from("stripe_webhook_replay_audit")
    .select("id, admin_user_id, event_id, status, error, ip_hash, user_agent, origin, created_at")
    .gte("created_at", fromDate.toISOString())
    .lte("created_at", toDate.toISOString());

  if (denialReason) q = q.eq("status", `denied:${denialReason}`);
  else if (statuses.length) q = q.in("status", statuses);
  else if (onlyDenied) q = q.like("status", "denied:%");

  q = q.order(sortBy, { ascending });
  if (page !== null && pageSize !== null) {
    q = q.range(page * pageSize, page * pageSize + pageSize - 1);
  } else {
    q = q.limit(10_000);
  }

  const { data: rows, error } = await q;
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

  const suffix = page !== null ? `_p${page + 1}` : "";
  const filename = `stripe-replay-audit_${body.from}_to_${body.to}${suffix}.csv`.replace(/[^\w.\-]+/g, "_");

  return new Response(csv, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Row-Count": String(rows?.length ?? 0),
      "X-Sort-By": sortBy,
      "X-Sort-Order": ascending ? "asc" : "desc",
    },
  });
});
