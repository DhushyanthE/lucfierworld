import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckoutCancel() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-xl">
        <Card className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-3">Checkout cancelled</h1>
          <p className="text-muted-foreground mb-6">No charge was made. You can try again anytime.</p>
          <Button asChild><Link to="/checkout">Back to checkout</Link></Button>
        </Card>
      </div>
    </Layout>
  );
}
