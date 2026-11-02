import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

/**
 * Sepolia faucet wiring for the wallet form.
 *
 * Every working Sepolia faucet needs either an account or (for the
 * no-account ones) browser work on the provider's site, so this panel does the
 * two things it can honestly do: puts the exact address on the clipboard and
 * opens the faucet. No fake "request sent" states.
 */

type Faucet = { name: string; url: string; note: string };

const FAUCETS: Faucet[] = [
  {
    name: "Google Cloud Web3",
    url: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
    note: "Sign in with Google — no captcha",
  },
  {
    name: "Alchemy",
    url: "https://www.alchemy.com/faucets/ethereum-sepolia",
    note: "Requires a free Alchemy account",
  },
  {
    name: "QuickNode",
    url: "https://faucet.quicknode.com/ethereum/sepolia",
    note: "Requires a QuickNode account",
  },
  {
    name: "Infura",
    url: "https://www.infura.io/faucet/sepolia",
    note: "Requires an Infura account",
  },
  {
    name: "PoW faucet (no account)",
    url: "https://sepolia-faucet.pk910.de/",
    note: "Mine test ETH in the browser — no sign-up",
  },
];

export function SepoliaFaucetPanel({
  address,
  onRefresh,
}: {
  address: string;
  onRefresh?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (!address) {
      toast.error("Connect or type a wallet address first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied — paste it into the faucet.");
      window.setTimeout(() => setCopied(false), 4000);
    } catch {
      toast.error("Could not copy the address; select it manually.");
    }
  };

  const openFaucet = (f: Faucet) => {
    if (!address) {
      toast.error("Connect or type a wallet address first.");
      return;
    }
    void copyAddress().finally(() => window.open(f.url, "_blank", "noopener,noreferrer"));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Fund this wallet from a Sepolia faucet
          <Badge variant="outline">test ETH only</Badge>
        </CardTitle>
        <CardDescription>
          Deployment needs roughly 0.005 test ETH. Every working faucet runs on the provider's
          site, so this copies your address and opens the faucet for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 truncate rounded-md border bg-muted px-3 py-2 text-sm">
            {address || "no address yet — connect or type one above"}
          </code>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void copyAddress()}>
              <Copy className="mr-2 h-4 w-4" />
              {copied ? "Copied" : "Copy address"}
            </Button>
            {onRefresh && (
              <Button variant="secondary" size="sm" onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check balance
              </Button>
            )}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {FAUCETS.map((f) => (
            <Button
              key={f.name}
              variant="secondary"
              size="sm"
              className="justify-between"
              onClick={() => openFaucet(f)}
            >
              <span className="flex flex-col items-start">
                <span>{f.name}</span>
                <span className="text-xs font-normal opacity-70">{f.note}</span>
              </span>
              <ExternalLink className="ml-2 h-4 w-4 shrink-0" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
