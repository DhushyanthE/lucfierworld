import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SERVICE_URLS } from "@/config/env";

/**
 * LeviathanCoin console — wallet, explorer, market and swap views over the real
 * on-chain contract, read through the read-only `leviathan-chain` edge function.
 *
 * When no RPC URL / contract address is configured server-side, every panel says
 * so explicitly. Nothing here fabricates a balance, a price or an event.
 */

const CHAIN_FN = `${SERVICE_URLS.FUNCTIONS_BASE}/leviathan-chain`;

type ChainState = {
  configured: boolean;
  contract?: string | null;
  total_supply_wei?: string;
  attestation_count?: number;
  balance_wei?: string | null;
  missing_secrets?: string[];
  reason?: string;
};

type ChainEvents = {
  configured: boolean;
  events?: { block_number: number; transaction_hash: string; topic0: string }[];
  events_indexed_this_run?: number;
  reason?: string;
};

const fromWei = (wei?: string | null) => {
  if (!wei) return null;
  const v = BigInt(wei);
  const whole = v / 10n ** 18n;
  const frac = (v % 10n ** 18n).toString().padStart(18, "0").slice(0, 4);
  return `${whole.toString()}.${frac}`;
};

export default function Leviathan() {
  const [address, setAddress] = useState("");
  const [state, setState] = useState<ChainState | null>(null);
  const [events, setEvents] = useState<ChainEvents | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (holder?: string) => {
    setLoading(true);
    setError(null);
    try {
      const q = holder ? `?address=${holder}` : "";
      const [s, e] = await Promise.all([
        fetch(`${CHAIN_FN}/state${q}`).then((r) => r.json()),
        fetch(`${CHAIN_FN}/attestations?window=2000`).then((r) => r.json()),
      ]);
      setState(s);
      setEvents(e);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed to reach the chain reader");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const connectWallet = async () => {
    const eth = (window as unknown as { ethereum?: { request: (a: unknown) => Promise<string[]> } }).ethereum;
    if (!eth) {
      setError("No EVM wallet detected in this browser.");
      return;
    }
    const accounts = await eth.request({ method: "eth_requestAccounts" });
    if (accounts?.[0]) {
      setAddress(accounts[0]);
      void load(accounts[0]);
    }
  };

  const notConfigured = state && state.configured === false;

  return (
    <main className="container mx-auto px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">LeviathanCoin (LVTH) Console</h1>
        <p className="text-muted-foreground max-w-3xl">
          Wallet, explorer, market and swap views backed by the deployed LeviathanCoin
          contract. All chain access is read-only — nothing on this page can sign a
          transaction or move funds.
        </p>
      </header>

      {notConfigured && (
        <Alert>
          <AlertTitle>No chain configured yet</AlertTitle>
          <AlertDescription>
            The backend has no {state?.missing_secrets?.join(" and ") || "RPC endpoint"} set, so
            there is no contract to read. Balances and events stay empty on purpose rather than
            showing invented numbers. Set <code>EVM_RPC_URL</code> and{" "}
            <code>LEVIATHAN_CONTRACT_ADDRESS</code> as backend secrets and this page fills in
            automatically.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Read failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="wallet">
        <TabsList>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="explorer">Explorer</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="swap">Swap</TabsTrigger>
        </TabsList>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle>LVTH balance</CardTitle>
              <CardDescription>Read with a single eth_call to balanceOf(address).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="0x… holder address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Button onClick={() => void load(address)} disabled={loading || !address}>
                  Read balance
                </Button>
                <Button variant="secondary" onClick={connectWallet}>
                  Connect wallet
                </Button>
              </div>
              <p className="text-2xl font-semibold">
                {fromWei(state?.balance_wei) ?? "—"}{" "}
                <span className="text-base text-muted-foreground">LVTH</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="explorer">
          <Card>
            <CardHeader>
              <CardTitle>Accepted attestations</CardTitle>
              <CardDescription>
                AttestationAccepted logs from the last 2000 blocks. Governance only records a
                CHSH score S with 2.0 &lt; S ≤ 2.828.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events?.events?.length ? (
                <ul className="space-y-2 text-sm">
                  {events.events.map((e) => (
                    <li key={`${e.transaction_hash}-${e.block_number}`} className="flex gap-3">
                      <Badge variant="outline">#{e.block_number}</Badge>
                      <code className="truncate">{e.transaction_hash}</code>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {events?.reason ?? "No attestation events in the scanned window."}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader><CardTitle className="text-base">Total supply</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold">
                {fromWei(state?.total_supply_wei) ?? "—"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Attestations</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold">
                {state?.attestation_count ?? "—"}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Epoch reward</CardTitle></CardHeader>
              <CardContent className="text-2xl font-semibold">5 LVTH</CardContent>
            </Card>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No market price is shown: LVTH is not listed on any exchange, so any price here
            would be fabricated. Supply and attestation counts are read from the contract.
          </p>
        </TabsContent>

        <TabsContent value="swap">
          <Card>
            <CardHeader>
              <CardTitle>Swap</CardTitle>
              <CardDescription>Quote-only — deliberately cannot submit a trade.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Swapping LVTH requires a liquidity pool and a signed transaction. Neither exists
                yet, and this app's chain layer is read-only by design, so there is nothing
                honest to execute here.
              </p>
              <p>
                Once a pool is deployed, the swap path needs its own review: allowance handling,
                slippage limits and an explicit user confirmation step.
              </p>
              <Button disabled>Swap unavailable</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
