import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    const poll = async () => {
      const { data } = await supabase.from("payments").select("*").eq("stripe_session_id", sessionId).maybeSingle();
      if (!cancelled && data) setPayment(data);
    };
    poll();
    const ch = supabase.channel(`pay:${sessionId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "payments", filter: `stripe_session_id=eq.${sessionId}` },
        (p) => setPayment(p.new))
      .subscribe();
    const t = setInterval(poll, 3000);
    return () => { cancelled = true; clearInterval(t); supabase.removeChannel(ch); };
  }, [sessionId]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-xl">
        <Card className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-3">Thank you!</h1>
          <p className="text-muted-foreground mb-4">
            {payment?.status === "paid"
              ? "Your payment was confirmed. Access has been unlocked."
              : "Waiting for Stripe to confirm your payment…"}
          </p>
          <p className="text-sm text-muted-foreground mb-6">Status: {payment?.status ?? "pending"}</p>
          <div className="flex gap-3 justify-center">
            <Button asChild><Link to="/">Go to app</Link></Button>
            <Button asChild variant="outline"><Link to="/checkout">Back to checkout</Link></Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
