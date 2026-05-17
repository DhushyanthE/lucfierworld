import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIN_RESPONSE_MS = 1200;
const GENERIC_MESSAGE = "If an account exists, a reset email will be sent.";
const RESET_COOLDOWN_MINUTES = 5;
const EMAIL_HOURLY_LIMIT = 3;
const REQUESTER_WINDOW_MINUTES = 15;
const REQUESTER_LIMIT = 5;
const RESET_ORIGINS = new Set([
  "http://localhost:5173",
  "https://id-preview--ce0f1d33-e51b-40ef-bec3-932163ebcacf.lovable.app",
  "https://lucfierworld.lovable.app",
]);

const successResponse = () =>
  new Response(JSON.stringify({ success: true, message: GENERIC_MESSAGE }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sha256Hex = async (value: string) => {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const normalizeEmail = (value: unknown) => {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
};

const getRedirectUrl = (value: unknown, origin: string | null) => {
  const fallbackOrigin = RESET_ORIGINS.has(origin ?? "") ? origin! : "https://lucfierworld.lovable.app";
  const fallback = `${fallbackOrigin}/#/auth`;
  if (typeof value !== "string" || value.length > 500) return fallback;

  try {
    const url = new URL(value);
    if (!RESET_ORIGINS.has(url.origin)) return fallback;
    if (!url.hash.startsWith("#/auth")) return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
};

const getRequesterFingerprint = async (req: Request) => {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown-ip";
  const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? "unknown-agent";
  return sha256Hex(`${forwarded}:${userAgent}`);
};

const checkResetAllowance = async (supabase: ReturnType<typeof createClient>, emailHash: string, requesterHash: string) => {
  const now = Date.now();
  const cooldownIso = new Date(now - RESET_COOLDOWN_MINUTES * 60_000).toISOString();
  const hourlyIso = new Date(now - 60 * 60_000).toISOString();
  const requesterIso = new Date(now - REQUESTER_WINDOW_MINUTES * 60_000).toISOString();

  await supabase.from("password_reset_attempts").delete().lt("attempted_at", new Date(now - 24 * 60 * 60_000).toISOString());

  const [{ count: cooldownCount }, { count: hourlyCount }, { count: requesterCount }] = await Promise.all([
    supabase.from("password_reset_attempts").select("id", { count: "exact", head: true })
      .eq("email_hash", emailHash).eq("allowed", true).gte("attempted_at", cooldownIso),
    supabase.from("password_reset_attempts").select("id", { count: "exact", head: true })
      .eq("email_hash", emailHash).eq("allowed", true).gte("attempted_at", hourlyIso),
    supabase.from("password_reset_attempts").select("id", { count: "exact", head: true })
      .eq("requester_hash", requesterHash).gte("attempted_at", requesterIso),
  ]);

  if ((cooldownCount ?? 0) > 0) return { allowed: false, reason: "email_cooldown" };
  if ((hourlyCount ?? 0) >= EMAIL_HOURLY_LIMIT) return { allowed: false, reason: "email_hourly_limit" };
  if ((requesterCount ?? 0) >= REQUESTER_LIMIT) return { allowed: false, reason: "requester_limit" };
  return { allowed: true, reason: "allowed" };
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return successResponse();

  const startTime = Date.now();
  const padResponse = async () => {
    const elapsed = Date.now() - startTime;
    if (elapsed < MIN_RESPONSE_MS) await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed));
  };

  try {
    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    const redirectTo = getRedirectUrl(body.redirectUrl, req.headers.get("origin"));

    if (!email) {
      await padResponse();
      return successResponse();
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      await padResponse();
      return successResponse();
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const emailHash = await sha256Hex(email);
    const requesterHash = await getRequesterFingerprint(req);
    const allowance = await checkResetAllowance(supabase, emailHash, requesterHash);

    await supabase.from("password_reset_attempts").insert({
      email_hash: emailHash,
      requester_hash: requesterHash,
      allowed: allowance.allowed,
      reason: allowance.reason,
    });

    if (!allowance.allowed) {
      console.warn("Password reset request suppressed", allowance.reason);
      await padResponse();
      return successResponse();
    }

    const resend = new Resend(resendApiKey);
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (error) {
      console.error("Error generating reset link:", error.message);
      await padResponse();
      return successResponse();
    }

    const resetLink = data.properties?.action_link;
    if (!resetLink) {
      console.error("No reset link generated");
      await padResponse();
      return successResponse();
    }

    const { error: emailError } = await resend.emails.send({
      from: "Quantum Blockchain <noreply@resend.dev>",
      to: [email],
      subject: "Reset Your Password - Quantum Blockchain",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff; color: #111827; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .card { background: #f9fafb; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb; }
            h1 { margin: 0 0 16px 0; font-size: 24px; color: #111827; text-align: center; }
            p { color: #374151; line-height: 1.6; margin: 0 0 24px 0; text-align: center; }
            .button-container { text-align: center; margin: 32px 0; }
            .button { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; }
            .note { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-top: 24px; }
            .note p { color: #6b7280; font-size: 14px; margin: 0; }
            .footer { text-align: center; margin-top: 32px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <h1>Password Reset Request</h1>
              <p>We received a request to reset your password for your Quantum Blockchain account.</p>
              <div class="button-container"><a href="${resetLink}" class="button">Reset Password</a></div>
              <div class="note"><p>This link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email.</p></div>
              <div class="footer"><p>© 2026 Quantum Blockchain.</p></div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) console.error("Error sending password reset email:", emailError.message);

    await padResponse();
    return successResponse();
  } catch (error) {
    console.error("Error in send-password-reset:", error instanceof Error ? error.message : String(error));
    await padResponse();
    return successResponse();
  }
});
