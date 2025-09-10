
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, ShieldCheck, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { formatCurrency } from '@/lib/utils';

interface TokenAsset {
  name: string;
  symbol: string;
  amount: string;
  value: number;
  change: number;
  color: string;
}

export function WalletOverview() {
  const { walletAddress, balance, chainId, currentWallet, quantumSecurity } = useWallet();
  const [assets] = useState<TokenAsset[]>([
    { 
      name: 'Quantum Coin', 
      symbol: 'QNTM', 
      amount: '125.45', 
      value: 18765.75, 
      change: 2.4,
      color: 'purple'
    },
    { 
      name: 'Ethereum', 
      symbol: 'ETH', 
      amount: '1.25', 
      value: 3750.25, 
      change: -0.8,
      color: 'blue'
    },
    { 
      name: 'USD Coin', 
      symbol: 'USDC', 
      amount: '1250.0', 
      value: 1250.0, 
      change: 0.1,
      color: 'green'
    }
  ]);
  
  const renderNetworkName = () => {
    if (!chainId) return 'Unknown Network';
    
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 56: return 'Binance Smart Chain';
      case 137: return 'Polygon';
      case 42161: return 'Arbitrum One';
      default: return `Chain ID: ${chainId}`;
    }
  };

  const getTotalBalance = () => {
    return assets.reduce((sum, token) => sum + token.value, 0);
  };

  const getSecurityBadge = () => {
    if (!quantumSecurity) return (
      <Badge className="bg-gray-600">Unknown</Badge>
    );
    
    switch (quantumSecurity.securityLevel) {
      case 'high':
        return <Badge className="bg-green-600">High Security</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600">Medium Security</Badge>;
      case 'low':
        return <Badge className="bg-red-600">Low Security</Badge>;
      default:
        return <Badge className="bg-gray-600">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-black/50 border-purple-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-medium flex items-center">
            <Wallet className="h-5 w-5 text-purple-400 mr-2" />
            Wallet Overview
          </CardTitle>
          {getSecurityBadge()}
        </div>
        <div className="text-sm text-gray-400">
          {renderNetworkName()} • {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : 'Not Connected'}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">Total Balance</div>
            <div className="text-2xl font-semibold text-white">
              {formatCurrency(getTotalBalance())}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">Native Token</div>
            <div className="text-2xl font-semibold text-white">
              {balance || "0.00"} {currentWallet === 'phantom' ? 'SOL' : 'ETH'}
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="text-sm text-gray-400 mb-1">Quantum Protection</div>
            <div className="text-2xl font-semibold flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2 text-purple-400" />
              <span className="text-green-400">Active</span>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-4">Asset Breakdown</h3>
        <div className="space-y-3">
          {assets.map((token, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-800">
              <div className="flex items-center">
                <div className={`w-10 h-10 bg-${token.color}-900/50 rounded-full flex items-center justify-center mr-3`}>
                  <span className="font-semibold text-purple-300">{token.symbol.substring(0, 2)}</span>
                </div>
                <div>
                  <div className="font-medium text-white">{token.name}</div>
                  <div className="text-sm text-gray-400">{token.amount} {token.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">{formatCurrency(token.value)}</div>
                <div className={`text-sm flex items-center ${token.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {token.change >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownLeft className="h-3 w-3 mr-1" />
                  )}
                  <span>{token.change >= 0 ? '+' : ''}{token.change}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
