import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Server-side price catalog: the caller chooses a product, never a price.
const PRODUCT_CATALOG: Record<string, { amount: number; currency: string; name: string }> = {
  pro_access: { amount: 1999, currency: "usd", name: "Pro Access" },
  enterprise_access: { amount: 99900, currency: "usd", name: "Enterprise Access" },
};

// Return URLs may only point at app origins we control.
const ALLOWED_ORIGINS = [
  "https://lucfierworld.lovable.app",
  "https://id-preview--ce0f1d33-e51b-40ef-bec3-932163ebcacf.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) throw new Error("Not authenticated");
    const user = userData.user;

    const body = await req.json().catch(() => ({}));
    const product: string = typeof body?.product === "string" && PRODUCT_CATALOG[body.product]
      ? body.product
      : "pro_access";
    const price = PRODUCT_CATALOG[product];
    // Amount, currency and name come exclusively from the server-side catalog.
    const { amount, currency, name } = price;

    // Only return to a known app origin.
    const requestedOrigin = req.headers.get("origin") || "";
    const origin = ALLOWED_ORIGINS.includes(requestedOrigin) ? requestedOrigin : ALLOWED_ORIGINS[0];

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    // Reuse customer only from this user's own payment record.
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: existing } = await admin
      .from("customer_status").select("stripe_customer_id").eq("user_id", user.id).maybeSingle();
    let customerId = existing?.stripe_customer_id ?? undefined;
    // Email-based customer reuse is only safe with a verified email address;
    // otherwise a user could inherit someone else's Stripe customer record.
    if (!customerId && user.email && user.email_confirmed_at) {
      const list = await stripe.customers.list({ email: user.email, limit: 1 });
      customerId = list.data[0]?.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      customer_email: customerId ? undefined : user.email ?? undefined,
      line_items: [{
        price_data: { currency, product_data: { name }, unit_amount: amount },
        quantity: 1,
      }],
      automatic_tax: { enabled: true },
      metadata: { user_id: user.id, product },
      success_url: `${origin}/#/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/checkout/cancel`,
    });

    await admin.from("payments").insert({
      user_id: user.id,
      stripe_session_id: session.id,
      stripe_customer_id: session.customer as string | null,
      amount_total: amount,
      currency,
      status: "pending",
      product,
      metadata: { name },
    });

    return new Response(JSON.stringify({ url: session.url, id: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("checkout error", e);
    return new Response(JSON.stringify({ error: String(e instanceof Error ? e.message : e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
