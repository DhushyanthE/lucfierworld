import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { QuantumAICapabilities } from '@/components/ai/QuantumAICapabilities';
import { useWallet } from '@/contexts/wallet-context';
import { QuantumWalletDashboard } from '@/components/wallet/QuantumWalletDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SERVICE_URLS } from '@/config/env';

const CHAIN_FN = `${SERVICE_URLS.FUNCTIONS_BASE}/leviathan-chain`;

type BackendWallet = {
  configured: boolean;
  address?: string | null;
  balance_eth?: string;
  network?: string;
  chain_id?: number;
  explorer_url?: string | null;
  missing?: string[];
};

type HolderState = {
  configured: boolean;
  contract?: string | null;
  balance_wei?: string | null;
  explorer_url?: string | null;
};

const fromWei = (value?: string | null) => {
  if (!value) return '0';
  const v = BigInt(value);
  const whole = v / 10n ** 18n;
  const frac = (v % 10n ** 18n).toString().padStart(18, '0').slice(0, 6).replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : whole.toString();
};

const Wallet: React.FC = () => {
  const { isConnected, walletAddress, chainId } = useWallet();
  const [backendWallet, setBackendWallet] = useState<BackendWallet | null>(null);
  const [holder, setHolder] = useState<HolderState | null>(null);

  useEffect(() => {
    if (!SERVICE_URLS.FUNCTIONS_BASE) return;
    let cancelled = false;
    const load = async () => {
      const walletResponse = await fetch(`${CHAIN_FN}/wallet`, { cache: 'no-store' });
      const walletData = await walletResponse.json();
      if (!cancelled) setBackendWallet(walletData as BackendWallet);

      if (walletAddress) {
        const stateResponse = await fetch(
          `${CHAIN_FN}/state?address=${encodeURIComponent(walletAddress)}`,
          { cache: 'no-store' },
        );
        const stateData = await stateResponse.json();
        if (!cancelled) setHolder(stateData as HolderState);
      } else if (!cancelled) {
        setHolder(null);
      }
    };
    void load().catch(() => {
      if (!cancelled) setBackendWallet(null);
    });
    const id = window.setInterval(() => void load(), 15_000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [walletAddress]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>LeviathanCoin Sepolia wallet</CardTitle>
              {backendWallet?.network && <Badge variant="outline">{backendWallet.network}</Badge>}
            </div>
            <CardDescription>
              Backend-confirmed deployment wallet and live Sepolia balance. The backend stores only
              the public address and uses read-only RPC calls; no wallet private key is loaded.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Deployment wallet</p>
              <code className="block break-all text-sm">{backendWallet?.address ?? 'not configured'}</code>
              <p className="mt-1 font-semibold">{backendWallet?.balance_eth ?? '—'} Sepolia ETH</p>
              {backendWallet?.explorer_url && (
                <a className="text-sm underline" href={backendWallet.explorer_url} target="_blank" rel="noreferrer">
                  Open on explorer
                </a>
              )}
              {!backendWallet?.configured && backendWallet?.missing?.length ? (
                <p className="text-xs text-muted-foreground mt-1">Missing: {backendWallet.missing.join(', ')}</p>
              ) : null}
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Connected browser wallet</p>
              <code className="block break-all text-sm">{walletAddress ?? 'not connected'}</code>
              <p className="mt-1 font-semibold">{holder ? fromWei(holder.balance_wei) : '—'} LVTH</p>
              <p className="text-xs text-muted-foreground">
                Browser chain ID: {isConnected ? chainId : '—'}; trading requires Sepolia (11155111).
              </p>
              {holder?.explorer_url && (
                <a className="text-sm underline" href={holder.explorer_url} target="_blank" rel="noreferrer">
                  Open LVTH contract
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <QuantumWalletDashboard />

        {!isConnected && (
          <div className="mt-8">
            <QuantumAICapabilities />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wallet;
