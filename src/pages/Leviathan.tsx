import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SERVICE_URLS } from "@/config/env";

/**
 * LeviathanCoin console — wallet, explorer, market and transfer views over the
 * real on-chain contract, read through the read-only `leviathan-chain` edge
 * function.
 *
 * Reads go through the edge function (no signer server-side). Writes are only
 * ever signed by the user's own browser wallet — this app never holds a key and
 * never fabricates a balance, price or event.
 */

const CHAIN_FN = `${SERVICE_URLS.FUNCTIONS_BASE}/leviathan-chain`;
const TRANSFER_SELECTOR = "0xa9059cbb"; // transfer(address,uint256)
const POLL_MS = 15_000;
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

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

type Sample = { t: number; label: string; supply: number; attestations: number };

type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const getWallet = () => (window as unknown as { ethereum?: Eip1193 }).ethereum;

const fromWei = (wei?: string | null) => {
  if (!wei) return null;
  const v = BigInt(wei);
  const whole = v / 10n ** 18n;
  const frac = (v % 10n ** 18n).toString().padStart(18, "0").slice(0, 4);
  return `${whole.toString()}.${frac}`;
};

const weiToNumber = (wei?: string) => (wei ? Number(BigInt(wei) / 10n ** 14n) / 10_000 : 0);

/** Parse a decimal token amount into an 18-decimal wei bigint without float loss. */
function toWei(amount: string): bigint {
  if (!/^\d+(\.\d{1,18})?$/.test(amount.trim())) {
    throw new Error("Enter an amount like 12 or 12.5 (max 18 decimals)");
  }
  const [whole, frac = ""] = amount.trim().split(".");
  return BigInt(whole + frac.padEnd(18, "0"));
}

const pad32 = (hex: string) => hex.replace(/^0x/, "").toLowerCase().padStart(64, "0");

export default function Leviathan() {
  const [address, setAddress] = useState("");
  const [state, setState] = useState<ChainState | null>(null);
  const [events, setEvents] = useState<ChainEvents | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // transfer form
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const holderRef = useRef<string>("");

  const load = useCallback(async (holder?: string, quiet = false) => {
    if (holder !== undefined) holderRef.current = holder;
    const who = holderRef.current;
    if (!quiet) setLoading(true);
    if (!quiet) setError(null);
    try {
      const q = who ? `?address=${who}` : "";
      const [s, e] = await Promise.all([
        fetch(`${CHAIN_FN}/state${q}`).then((r) => r.json()),
        fetch(`${CHAIN_FN}/attestations?window=2000`).then((r) => r.json()),
      ]);
      setState(s as ChainState);
      setEvents(e as ChainEvents);
      if ((s as ChainState).configured && (s as ChainState).total_supply_wei) {
        const now = Date.now();
        setSamples((prev) =>
          [
            ...prev,
            {
              t: now,
              label: new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              supply: weiToNumber((s as ChainState).total_supply_wei),
              attestations: (s as ChainState).attestation_count ?? 0,
            },
          ].slice(-40),
        );
      }
    } catch (err) {
      if (!quiet) setError(err instanceof Error ? err.message : "failed to reach the chain reader");
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(undefined, true), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const connectWallet = async () => {
    const eth = getWallet();
    if (!eth) {
      setError("No EVM wallet detected in this browser.");
      return;
    }
    const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
    if (accounts?.[0]) {
      setAddress(accounts[0]);
      void load(accounts[0]);
    }
  };

  const sendTokens = async () => {
    const eth = getWallet();
    setError(null);
    setTxHash(null);
    try {
      if (!eth) throw new Error("No EVM wallet detected in this browser.");
      if (!state?.configured || !state.contract) {
        throw new Error("No LeviathanCoin contract is configured yet, so there is nothing to send.");
      }
      if (!ADDRESS_RE.test(recipient.trim())) throw new Error("Recipient must be a 0x… address.");
      const value = toWei(amount);
      if (value === 0n) throw new Error("Amount must be greater than zero.");

      const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
      const from = accounts?.[0];
      if (!from) throw new Error("Wallet did not return an account.");

      setSending(true);
      const data =
        TRANSFER_SELECTOR + pad32(recipient.trim()) + pad32("0x" + value.toString(16));
      const hash = (await eth.request({
        method: "eth_sendTransaction",
        params: [{ from, to: state.contract, data }],
      })) as string;
      setTxHash(hash);
      toast.success("Transfer submitted", { description: hash });
      setAmount("");
      // Balances only change once the transaction is mined.
      window.setTimeout(() => void load(from), 15_000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "the wallet rejected the transfer";
      setError(message);
      toast.error("Transfer failed", { description: message });
    } finally {
      setSending(false);
    }
  };

  const notConfigured = state && state.configured === false;
  const balance = fromWei(state?.balance_wei);

  return (
    <main className="container mx-auto px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">LeviathanCoin (LVTH) Console</h1>
        <p className="text-muted-foreground max-w-3xl">
          Wallet, explorer, market and transfer views backed by the deployed LeviathanCoin
          contract. Reads come from the contract; any transfer is signed by your own wallet —
          this app never holds a key.
        </p>
      </header>

      {notConfigured && (
        <Alert>
          <AlertTitle>No chain configured yet</AlertTitle>
          <AlertDescription>
            The backend has no {state?.missing_secrets?.join(" and ") || "RPC endpoint"} set, so
            there is no contract to read. Balances, transfers and events stay empty on purpose
            rather than showing invented numbers.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="wallet">
        <TabsList>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="explorer">Explorer</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="transfer">Send &amp; receive</TabsTrigger>
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
                {balance ?? "—"}{" "}
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

        <TabsContent value="market" className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live supply ticker</CardTitle>
              <CardDescription>
                Sampled straight from the contract every {POLL_MS / 1000} seconds while this page
                is open. Each new accepted attestation mints 5 LVTH, so the line steps up.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {samples.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={samples}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="supply"
                      name="Total supply (LVTH)"
                      stroke="hsl(var(--primary))"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {state?.configured
                    ? "Collecting the first samples from the contract…"
                    : "Nothing to chart until a contract address is configured."}
                </p>
              )}
            </CardContent>
          </Card>

          <Alert>
            <AlertTitle>No price or trading volume exists yet</AlertTitle>
            <AlertDescription>
              LVTH has no liquidity pool and is not listed on any exchange, so there is no market
              price and no trade volume to report — any figure here would be invented. What is
              real and shown above: circulating supply, attestation count and the mint rate, read
              live from the contract. Once a pool exists, price and volume can be derived from its
              swap events.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="transfer">
          <Card>
            <CardHeader>
              <CardTitle>Send &amp; receive LVTH</CardTitle>
              <CardDescription>
                A real ERC-20 transfer, signed in your wallet and broadcast to the chain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="lvth-to">Recipient address</Label>
                <Input
                  id="lvth-to"
                  placeholder="0x…"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lvth-amount">Amount (LVTH)</Label>
                <Input
                  id="lvth-amount"
                  inputMode="decimal"
                  placeholder="10.5"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your balance: {balance ?? "connect a wallet to read it"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void sendTokens()} disabled={sending || !state?.configured}>
                  {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send LVTH
                </Button>
                <Button variant="secondary" onClick={connectWallet}>
                  Connect wallet
                </Button>
                <Button variant="outline" onClick={() => void load(address || undefined)}>
                  Refresh balance
                </Button>
              </div>

              {txHash && (
                <Alert>
                  <AlertTitle>Transfer submitted</AlertTitle>
                  <AlertDescription className="space-y-1">
                    <code className="block break-all text-xs">{txHash}</code>
                    <span className="text-xs text-muted-foreground">
                      The balance above updates once the transaction is mined.
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium">Receiving</p>
                <p className="text-muted-foreground">
                  To receive LVTH, share your connected address:{" "}
                  <code className="break-all">{address || "not connected"}</code>. Add the token
                  to your wallet with the contract address{" "}
                  <code className="break-all">{state?.contract ?? "not configured"}</code> and 18
                  decimals.
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                There is no deposit vault or swap pool: LVTH only moves by direct transfer today.
                A swap would need a liquidity pool, allowance handling and slippage limits, none
                of which exist yet — so nothing here pretends to trade.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
