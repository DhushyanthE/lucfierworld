import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, Contract, formatEther, formatUnits, parseEther, parseUnits } from "ethers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SERVICE_URLS } from "@/config/env";
import { toast } from "sonner";

const CHAIN_FN = `${SERVICE_URLS.FUNCTIONS_BASE}/leviathan-chain`;
const SEPOLIA_CHAIN_ID = 11155111n;
const SLIPPAGE_BPS = 100n; // 1%

const ABI = [
  "function quoteEthForLvth(uint256 ethIn) view returns (uint256)",
  "function quoteLvthForEth(uint256 lvthIn) view returns (uint256)",
  "function swapEthForLvth(uint256 minLvthOut) payable returns (uint256)",
  "function swapLvthForEth(uint256 lvthIn,uint256 minEthOut) returns (uint256)",
];

type Side = "ETH_TO_LVTH" | "LVTH_TO_ETH";

export function LeviathanSwapPanel() {
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [side, setSide] = useState<Side>("ETH_TO_LVTH");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<bigint | null>(null);
  const [busy, setBusy] = useState(false);

  const loadMarket = useCallback(async () => {
    const res = await fetch(`${CHAIN_FN}/market?window=7200`);
    const body = await res.json();
    setContractAddress(body?.configured ? body.contract : null);
    setNetwork(body?.network ?? null);
  }, []);

  useEffect(() => {
    void loadMarket().catch(() => undefined);
  }, [loadMarket]);

  const getContract = async () => {
    if (!contractAddress) throw new Error("LeviathanCoin is not configured on the backend.");
    const ethereum = (window as any).ethereum;
    if (!ethereum) throw new Error("No EVM wallet detected in this browser.");
    const provider = new BrowserProvider(ethereum);
    await provider.send("eth_requestAccounts", []);
    const walletNetwork = await provider.getNetwork();
    if (walletNetwork.chainId !== SEPOLIA_CHAIN_ID) {
      throw new Error(`Switch the connected wallet to Sepolia (11155111). Current chain: ${walletNetwork.chainId}`);
    }
    const signer = await provider.getSigner();
    return new Contract(contractAddress, ABI, signer);
  };

  const getQuote = async () => {
    if (!amount || Number(amount) <= 0) throw new Error("Enter an amount greater than zero.");
    const contract = await getContract();
    const q = side === "ETH_TO_LVTH"
      ? await contract.quoteEthForLvth(parseEther(amount))
      : await contract.quoteLvthForEth(parseUnits(amount, 18));
    setQuote(BigInt(q));
    return BigInt(q);
  };

  const executeSwap = async () => {
    setBusy(true);
    try {
      const contract = await getContract();
      const q = quote ?? await getQuote();
      if (q <= 0n) throw new Error("Pool has no usable liquidity for this quote.");
      const minOut = (q * (10_000n - SLIPPAGE_BPS)) / 10_000n;

      const tx = side === "ETH_TO_LVTH"
        ? await contract.swapEthForLvth(minOut, { value: parseEther(amount) })
        : await contract.swapLvthForEth(parseUnits(amount, 18), minOut);

      toast.info("Swap submitted", { description: tx.hash });
      await tx.wait();
      toast.success("LVTH swap confirmed", { description: tx.hash });
      setQuote(null);
      setAmount("");
      await loadMarket();
    } catch (e) {
      toast.error("Swap failed", {
        description: e instanceof Error ? e.message : "Wallet or contract rejected the swap",
      });
    } finally {
      setBusy(false);
    }
  };

  const quoteText = quote === null
    ? "—"
    : side === "ETH_TO_LVTH"
      ? `${formatUnits(quote, 18)} LVTH`
      : `${formatEther(quote)} ETH`;

  return (
    <Card className="border-cyan-500/20 bg-black/50">
      <CardHeader>
        <CardTitle className="text-base">LVTH / ETH Sepolia swap</CardTitle>
        <CardDescription>
          Real constant-product swap signed by your browser wallet. Backend network: {network ?? "not configured"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[180px_1fr_auto_auto] md:items-end">
          <div className="space-y-1">
            <Label>Direction</Label>
            <select
              value={side}
              onChange={(e) => {
                setSide(e.target.value as Side);
                setQuote(null);
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ETH_TO_LVTH">ETH → LVTH</option>
              <option value="LVTH_TO_ETH">LVTH → ETH</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Amount ({side === "ETH_TO_LVTH" ? "ETH" : "LVTH"})</Label>
            <Input
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setQuote(null);
              }}
              placeholder={side === "ETH_TO_LVTH" ? "0.01" : "100"}
            />
          </div>
          <Button
            variant="secondary"
            disabled={busy || !contractAddress}
            onClick={() => void getQuote().catch((e) => toast.error("Quote failed", { description: e.message }))}
          >
            Get quote
          </Button>
          <Button disabled={busy || !contractAddress || !quote} onClick={() => void executeSwap()}>
            {busy ? "Waiting for wallet…" : "Swap"}
          </Button>
        </div>
        <div className="rounded-md border p-3 text-sm">
          <span className="text-muted-foreground">Expected output: </span>
          <span className="font-medium">{quoteText}</span>
          <span className="ml-3 text-xs text-muted-foreground">1% minimum-output protection • 0.30% pool fee</span>
        </div>
        <p className="text-xs text-muted-foreground break-all">
          Contract: {contractAddress ?? "waiting for LEVIATHAN_CONTRACT_ADDRESS"}
        </p>
      </CardContent>
    </Card>
  );
}
