import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const whSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !whSecret) {
    return new Response("Missing Stripe config", { status: 500, headers: corsHeaders });
  }
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400, headers: corsHeaders });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, whSecret);
  } catch (e) {
    console.error("Bad signature", e);
    return new Response(`Bad signature: ${e}`, { status: 400, headers: corsHeaders });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = s.metadata?.user_id;
        const product = s.metadata?.product ?? "pro_access";
        await admin.from("payments").update({
          status: s.payment_status === "paid" ? "paid" : (s.payment_status ?? "pending"),
          stripe_payment_intent_id: typeof s.payment_intent === "string" ? s.payment_intent : null,
          stripe_customer_id: typeof s.customer === "string" ? s.customer : null,
          amount_total: s.amount_total ?? undefined,
          currency: s.currency ?? undefined,
        }).eq("stripe_session_id", s.id);

        if (userId && s.payment_status === "paid") {
          await admin.from("customer_status").upsert({
            user_id: userId,
            tier: product,
            active: true,
            stripe_customer_id: typeof s.customer === "string" ? s.customer : null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

          await admin.from("notifications").insert({
            user_id: userId,
            title: "Payment confirmed",
            message: `Your ${product} purchase was successful.`,
            type: "success",
            data: { session_id: s.id },
          });
        }
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const s = event.data.object as Stripe.Checkout.Session;
        await admin.from("payments").update({ status: "failed" }).eq("stripe_session_id", s.id);
        break;
      }
      default:
        // ignore others
        break;
    }
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("webhook handler error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
