import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceData {
  symbol: string;
  price: number;
}

interface PriceAlert {
  id: string;
  user_id: string;
  symbol: string;
  target_price: number;
  condition: "above" | "below";
  notification_method: "in_app" | "email" | "both";
  email_sent: boolean;
  is_active: boolean;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting price alert check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current prices from request body or fetch from CoinMarketCap
    let currentPrices: PriceData[] = [];
    
    try {
      const body = await req.json();
      if (body.prices && Array.isArray(body.prices)) {
        currentPrices = body.prices;
        console.log("Using provided prices:", currentPrices.length);
      }
    } catch {
      // No body provided, fetch prices
    }

    // If no prices provided, fetch from CoinMarketCap proxy
    if (currentPrices.length === 0) {
      console.log("Fetching prices from CoinMarketCap...");
      const cmcApiKey = Deno.env.get("COINMARKETCAP_API_KEY");
      
      if (cmcApiKey) {
        const response = await fetch(
          "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=100",
          {
            headers: {
              "X-CMC_PRO_API_KEY": cmcApiKey,
              "Accept": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          currentPrices = data.data.map((coin: any) => ({
            symbol: coin.symbol,
            price: coin.quote.USD.price,
          }));
          console.log("Fetched", currentPrices.length, "prices from CoinMarketCap");
        }
      }
    }

    if (currentPrices.length === 0) {
      console.log("No prices available, skipping check");
      return new Response(
        JSON.stringify({ success: false, message: "No price data available" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create price lookup map
    const priceMap = new Map<string, number>();
    currentPrices.forEach((p) => priceMap.set(p.symbol.toUpperCase(), p.price));

    // Fetch all active alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("is_active", true)
      .is("triggered_at", null);

    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
      throw alertsError;
    }

    console.log("Found", alerts?.length || 0, "active alerts to check");

    const triggeredAlerts: PriceAlert[] = [];
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    for (const alert of alerts || []) {
      const currentPrice = priceMap.get(alert.symbol.toUpperCase());
      if (!currentPrice) {
        console.log(`No price found for ${alert.symbol}`);
        continue;
      }

      const isTriggered =
        alert.condition === "above"
          ? currentPrice >= alert.target_price
          : currentPrice <= alert.target_price;

      if (isTriggered) {
        console.log(
          `Alert triggered: ${alert.symbol} ${alert.condition} ${alert.target_price} (current: ${currentPrice})`
        );

        triggeredAlerts.push(alert);

        // Update alert as triggered
        const { error: updateError } = await supabase
          .from("price_alerts")
          .update({
            triggered_at: new Date().toISOString(),
            is_active: false,
          })
          .eq("id", alert.id);

        if (updateError) {
          console.error("Error updating alert:", updateError);
        }

        const conditionText = alert.condition === "above" ? "risen above" : "fallen below";

        // Create in-app notification (using service role bypasses RLS)
        if (alert.notification_method === "in_app" || alert.notification_method === "both") {
          const { error: notifError } = await supabase
            .from("notifications")
            .insert({
              user_id: alert.user_id,
              title: `🚨 ${alert.symbol} Price Alert`,
              message: `${alert.symbol} has ${conditionText} your target of $${alert.target_price.toLocaleString()}. Current price: $${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              type: "price_alert",
              data: {
                symbol: alert.symbol,
                condition: alert.condition,
                target_price: alert.target_price,
                current_price: currentPrice,
                alert_id: alert.id,
              },
            });

          if (notifError) {
            console.error("Error creating in-app notification:", notifError);
          } else {
            console.log("In-app notification created for user:", alert.user_id);
          }
        }

        // Send email notification if configured
        if (
          resend &&
          (alert.notification_method === "email" || alert.notification_method === "both")
        ) {
          try {
            // Get user email
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
              alert.user_id
            );

            if (userError || !userData?.user?.email) {
              console.error("Could not get user email:", userError);
              continue;
            }

            const userEmail = userData.user.email;

            const { error: emailError } = await resend.emails.send({
              from: "Crypto Alerts <alerts@resend.dev>",
              to: [userEmail],
              subject: `🚨 Price Alert: ${alert.symbol} has ${conditionText} $${alert.target_price.toLocaleString()}`,
              html: `
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f23; color: #fff; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                    .card { background: linear-gradient(135deg, #1a1a3e 0%, #2d1f4d 100%); border-radius: 16px; padding: 32px; border: 1px solid rgba(139, 92, 246, 0.3); }
                    .header { text-align: center; margin-bottom: 24px; }
                    .alert-icon { font-size: 48px; margin-bottom: 16px; }
                    h1 { margin: 0; font-size: 24px; color: #fff; }
                    .price-info { background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0; }
                    .symbol { font-size: 32px; font-weight: bold; color: #8b5cf6; }
                    .price { font-size: 28px; color: ${alert.condition === "above" ? "#22c55e" : "#ef4444"}; margin-top: 8px; }
                    .target { color: #9ca3af; font-size: 14px; margin-top: 8px; }
                    .footer { text-align: center; margin-top: 24px; color: #6b7280; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="card">
                      <div class="header">
                        <div class="alert-icon">🔔</div>
                        <h1>Price Alert Triggered!</h1>
                      </div>
                      <div class="price-info">
                        <div class="symbol">${alert.symbol}</div>
                        <div class="price">Current: $${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div class="target">Your target: ${alert.condition === "above" ? "Above" : "Below"} $${alert.target_price.toLocaleString()}</div>
                      </div>
                      <p style="color: #d1d5db; text-align: center;">
                        ${alert.symbol} has ${conditionText} your target price of $${alert.target_price.toLocaleString()}.
                      </p>
                      <div class="footer">
                        <p>This alert has been automatically disabled. Create a new alert to continue monitoring.</p>
                      </div>
                    </div>
                  </div>
                </body>
                </html>
              `,
            });

            if (emailError) {
              console.error("Error sending email:", emailError);
            } else {
              console.log("Email sent successfully to:", userEmail);
              
              // Mark email as sent
              await supabase
                .from("price_alerts")
                .update({ email_sent: true })
                .eq("id", alert.id);
            }
          } catch (emailErr) {
            console.error("Email sending failed:", emailErr);
          }
        }
      }
    }

    console.log("Check complete. Triggered alerts:", triggeredAlerts.length);

    return new Response(
      JSON.stringify({
        success: true,
        checked: alerts?.length || 0,
        triggered: triggeredAlerts.length,
        triggeredAlerts: triggeredAlerts.map((a) => ({
          id: a.id,
          symbol: a.symbol,
          condition: a.condition,
          target_price: a.target_price,
        })),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in check-price-alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});