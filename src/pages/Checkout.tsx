import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const PRODUCTS = [
  { id: "pro_access", name: "Pro Access", amount: 1999, currency: "usd", description: "Unlock advanced quantum tools." },
  { id: "enterprise", name: "Enterprise", amount: 9999, currency: "usd", description: "Team-wide access + priority support." },
];

export default function Checkout() {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<{ tier: string; active: boolean } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase.from("customer_status").select("tier, active").eq("user_id", userId).maybeSingle()
      .then(({ data }) => data && setStatus(data));

    const ch = supabase.channel(`cs:${userId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "customer_status", filter: `user_id=eq.${userId}` },
        (p) => {
          const row = p.new as any;
          setStatus({ tier: row.tier, active: row.active });
          if (row.active) toast.success(`${row.tier} activated`);
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId]);

  const buy = async (p: typeof PRODUCTS[number]) => {
    setLoading(p.id);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: { product: p.id, amount: p.amount, currency: p.currency, name: p.name },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e: any) {
      toast.error(e.message || "Checkout failed");
    } finally { setLoading(null); }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-6">
          {status?.active ? `Current plan: ${status.tier} ✓` : "Pick a plan to unlock features."}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Card key={p.id} className="p-6 flex flex-col gap-3">
              <h2 className="text-xl font-semibold">{p.name}</h2>
              <p className="text-2xl font-bold">${(p.amount / 100).toFixed(2)}</p>
              <p className="text-sm text-muted-foreground flex-1">{p.description}</p>
              <Button onClick={() => buy(p)} disabled={!userId || loading === p.id}>
                {loading === p.id ? "Redirecting…" : userId ? "Pay with Stripe" : "Sign in to buy"}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
