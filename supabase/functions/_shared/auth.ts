import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export interface AuthContext {
  userId: string;
  token: string;
  client: SupabaseClient;
}

/**
 * Verifies the caller's Supabase session before any privileged or metered work.
 * Returns the caller context, or throws a Response already shaped for the client.
 */
export async function requireAuth(req: Request): Promise<AuthContext> {
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const token = req.headers.get("authorization");
  if (!url || !anon || !token?.startsWith("Bearer ")) {
    throw json({ error: "authentication required" }, 401);
  }
  const client = createClient(url, anon, {
    global: { headers: { Authorization: token } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token.slice(7));
  if (error || !data.user) throw json({ error: "invalid user session" }, 401);
  return { userId: data.user.id, token, client };
}

/** Restricts a function to admins; use for privileged control-plane actions. */
export async function requireAdmin(req: Request): Promise<AuthContext> {
  const ctx = await requireAuth(req);
  const { data: roles, error } = await ctx.client
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId);
  if (error || !roles?.some((r) => r.role === "admin")) {
    throw json({ error: "admin access required" }, 403);
  }
  return ctx;
}

/** Limits request bodies to a sane size before parsing. */
export async function readJson(req: Request, maxBytes = 256_000): Promise<any> {
  const text = await req.text();
  if (text.length > maxBytes) throw json({ error: "request too large" }, 413);
  try {
    return JSON.parse(text);
  } catch {
    throw json({ error: "invalid JSON body" }, 400);
  }
}

export function handleAuthError(error: unknown): Response | null {
  if (error instanceof Response) return error;
  return null;
}
