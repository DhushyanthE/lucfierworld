import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  action: "enable" | "disable";
  secret?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body || (body.action !== "enable" && body.action !== "disable")) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    if (body.action === "enable") {
      if (!body.secret || typeof body.secret !== "string" || body.secret.length < 16 || body.secret.length > 128) {
        return new Response(JSON.stringify({ error: "Invalid secret" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error: secretErr } = await admin
        .from("user_secrets")
        .upsert({ user_id: user.id, totp_secret: body.secret }, { onConflict: "user_id" });
      if (secretErr) throw secretErr;
      const { error: profileErr } = await admin
        .from("profiles")
        .update({ totp_enabled: true })
        .eq("user_id", user.id);
      if (profileErr) throw profileErr;
    } else {
      await admin
        .from("user_secrets")
        .update({ totp_secret: null })
        .eq("user_id", user.id);
      const { error: profileErr } = await admin
        .from("profiles")
        .update({ totp_enabled: false })
        .eq("user_id", user.id);
      if (profileErr) throw profileErr;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("totp-manage error:", e?.message || e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
