import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const SUCCESS_EVENTS = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);
const FAILURE_EVENTS = new Set(["checkout.session.expired", "checkout.session.async_payment_failed"]);

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const money = (amount: number | null, currency: string | null) => {
  if (!amount || !currency) return "your purchase";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
  } catch {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
};

const getSessionFields = (event: Stripe.Event) => {
  if (!SUCCESS_EVENTS.has(event.type) && !FAILURE_EVENTS.has(event.type)) {
    return { stripe_session_id: null, payment_intent_id: null, user_id: null };
  }
  const session = event.data.object as Stripe.Checkout.Session;
  return {
    stripe_session_id: session.id,
    payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
    user_id: session.metadata?.user_id ?? null,
  };
};

export const sendReceipt = async (session: Stripe.Checkout.Session, product: string) => {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const to = session.customer_details?.email ?? session.customer_email;
  if (!resendApiKey || !to || session.payment_status !== "paid") return null;

  const resend = new Resend(resendApiKey);
  const safeProduct = escapeHtml(product.replaceAll("_", " "));
  const safeAmount = escapeHtml(money(session.amount_total, session.currency));
  const safeSession = escapeHtml(session.id);

  const { error } = await resend.emails.send({
    from: "Quantum Blockchain <noreply@resend.dev>",
    to: [to],
    subject: "Payment confirmed - Quantum Blockchain",
    html: `
      <!doctype html>
      <html>
        <body style="margin:0;background:#ffffff;color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
            <h1 style="font-size:24px;margin:0 0 12px;">Payment confirmed</h1>
            <p style="font-size:16px;line-height:1.6;margin:0 0 20px;color:#374151;">
              Your ${safeProduct} access is active. We received ${safeAmount} for checkout session ${safeSession}.
            </p>
            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;background:#f9fafb;">
              <p style="margin:0;color:#4b5563;line-height:1.5;">You can return to the app now; your customer status will update automatically.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  return error ? `Receipt email failed: ${error.message}` : null;
};

export const processStripeEvent = async (admin: any, event: Stripe.Event, receiptSender = sendReceipt) => {
  let receiptError: string | null = null;

  if (SUCCESS_EVENTS.has(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const product = session.metadata?.product ?? "pro_access";
    const paymentStatus = session.payment_status === "paid" ? "paid" : (session.payment_status ?? "pending");

    const { error: paymentError } = await admin.from("payments").update({
      status: paymentStatus,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      amount_total: session.amount_total ?? undefined,
      currency: session.currency ?? undefined,
    }).eq("stripe_session_id", session.id);
    if (paymentError) throw paymentError;

    if (userId && session.payment_status === "paid") {
      const { error: statusError } = await admin.from("customer_status").upsert({
        user_id: userId,
        tier: product,
        active: true,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (statusError) throw statusError;

      const { error: notificationError } = await admin.from("notifications").insert({
        user_id: userId,
        title: "Payment confirmed",
        message: `Your ${product} purchase was successful.`,
        type: "success",
        data: { session_id: session.id, stripe_event_id: event.id },
      });
      if (notificationError) throw notificationError;

      receiptError = await receiptSender(session, product);
    }
  } else if (FAILURE_EVENTS.has(event.type)) {
    const session = event.data.object as Stripe.Checkout.Session;
    const { error: paymentError } = await admin.from("payments").update({
      status: event.type === "checkout.session.expired" ? "expired" : "failed",
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
    }).eq("stripe_session_id", session.id);
    if (paymentError) throw paymentError;
  }

  return { status: receiptError ? "processed_with_email_error" : "processed", error: receiptError };
};

export const serveStripeWebhook = async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const whSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeKey || !whSecret || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Webhook configuration missing" }, 500);
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return jsonResponse({ error: "Missing signature" }, 400);

  const rawBody = await req.text();
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  const admin = createClient(supabaseUrl, serviceRoleKey);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, whSecret);
  } catch (e) {
    console.error("Bad Stripe signature", e);
    return jsonResponse({ error: "Bad signature" }, 400);
  }

  const { error: insertError } = await admin.from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
    ...getSessionFields(event),
    status: "processing",
    payload: event as unknown as Record<string, unknown>,
  });

  if (insertError) {
    const { data: existing } = await admin
      .from("stripe_webhook_events")
      .select("status,error,processed_at")
      .eq("event_id", event.id)
      .maybeSingle();

    if (existing) {
      return jsonResponse({ received: true, duplicate: true, status: existing.status });
    }

    console.error("Unable to log Stripe event", insertError);
    return jsonResponse({ error: "Unable to log webhook event" }, 500);
  }

  const finish = async (status: string, error: string | null = null) => {
    await admin.from("stripe_webhook_events").update({
      status,
      error,
      processed_at: new Date().toISOString(),
    }).eq("event_id", event.id);
  };

  try {
    const result = await processStripeEvent(admin, event);
    await finish(result.status, result.error);
    return jsonResponse({ received: true, processed: true, status: result.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Stripe webhook handler error", message);
    await finish("failed", message.slice(0, 1000));
    return jsonResponse({ error: message }, 500);
  }
};

if (import.meta.main) {
  serve(serveStripeWebhook);
}
