import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SERVICE_URLS } from "@/config/env";

const CHAIN_FN = `${SERVICE_URLS.FUNCTIONS_BASE}/leviathan-chain`;

type Mode = "wallet" | "explorer" | "market";

const format18 = (value?: string | null, digits = 6) => {
  if (!value) return "—";
  try {
    const v = BigInt(value);
    const whole = v / 10n ** 18n;
    const frac = (v % 10n ** 18n).toString().padStart(18, "0").slice(0, digits);
    return `${whole}.${frac}`;
  } catch {
    return "—";
  }
};

export function LeviathanLiveStatus({
  mode,
  holderAddress,
}: {
  mode: Mode;
  holderAddress?: string | null;
}) {
  const [data, setData] = useState<any>(null);
  const [secondary, setSecondary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setError(null);
        if (mode === "wallet") {
          const stateUrl = holderAddress
            ? `${CHAIN_FN}/state?address=${encodeURIComponent(holderAddress)}`
            : `${CHAIN_FN}/state`;
          const [deployer, state] = await Promise.all([
            fetch(`${CHAIN_FN}/deployer`).then((r) => r.json()),
            fetch(stateUrl).then((r) => r.json()),
          ]);
          if (!cancelled) {
            setData(deployer);
            setSecondary(state);
          }
        } else if (mode === "explorer") {
          const [health, events] = await Promise.all([
            fetch(`${CHAIN_FN}/health`).then((r) => r.json()),
            fetch(`${CHAIN_FN}/attestations?window=2000`).then((r) => r.json()),
          ]);
          if (!cancelled) {
            setData(health);
            setSecondary(events);
          }
        } else {
          const market = await fetch(`${CHAIN_FN}/market?window=7200`).then((r) => r.json());
          if (!cancelled) setData(market);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "live chain request failed");
      }
    };

    void load();
    const id = window.setInterval(() => void load(), 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [mode, holderAddress]);

  const network = data?.network ?? secondary?.network ?? null;
  const contract = data?.contract ?? secondary?.contract ?? null;

  return (
    <Card className="border-cyan-500/20 bg-black/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">LeviathanCoin live chain</CardTitle>
          <Badge variant="outline">{network ?? "not configured"}</Badge>
        </div>
        <CardDescription>
          {contract ? (
            <code className="break-all">{contract}</code>
          ) : (
            "Waiting for LEVIATHAN_CONTRACT_ADDRESS on the backend."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {error && <p className="text-red-400">{error}</p>}

        {mode === "wallet" && (
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Backend deployer</p>
              <code className="break-all">{data?.address ?? "not configured"}</code>
            </div>
            <div>
              <p className="text-muted-foreground">Sepolia ETH</p>
              <p className="font-medium">{data?.balance_eth ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Holder LVTH</p>
              <p className="font-medium">{format18(secondary?.balance_wei)} LVTH</p>
            </div>
          </div>
        )}

        {mode === "explorer" && (
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Chain ID</p>
              <p className="font-medium">{data?.chain_id ?? secondary?.chain_id ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Recent attestations</p>
              <p className="font-medium">{secondary?.events_indexed_this_run ?? 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Read boundary</p>
              <p className="font-medium">{data?.read_only === false ? "unexpected write access" : "read-only backend"}</p>
            </div>
          </div>
        )}

        {mode === "market" && (
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <p className="text-muted-foreground">LVTH price</p>
              <p className="font-medium">{format18(data?.spot_price_wei_per_lvth)} ETH</p>
            </div>
            <div>
              <p className="text-muted-foreground">ETH reserve</p>
              <p className="font-medium">{format18(data?.pool_eth_reserve_wei)} ETH</p>
            </div>
            <div>
              <p className="text-muted-foreground">LVTH reserve</p>
              <p className="font-medium">{format18(data?.pool_lvth_reserve_wei)} LVTH</p>
            </div>
            <div>
              <p className="text-muted-foreground">Recent volume</p>
              <p className="font-medium">
                {format18(data?.recent_eth_volume_wei)} ETH / {format18(data?.recent_lvth_volume_wei)} LVTH
              </p>
              <p className="text-xs text-muted-foreground">{data?.recent_swap_count ?? 0} swaps in scanned window</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
