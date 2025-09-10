
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'swap';
  amount: number;
  token: string;
  tokenAmount: number;
  usdValue: number;
  counterpartyAddress: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  hash: string;
}

export function RecentTransactions() {
  // Sample transaction data
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'received',
      amount: 15.2,
      token: 'QNTM',
      tokenAmount: 15.2,
      usdValue: 2280.00,
      counterpartyAddress: '0x71C...9E3a',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'completed',
      hash: '0x8f7d12c23a4b901d3f8ac7e85f479c28dd19b479f985d76a4a4a3834959a9ec0'
    },
    {
      id: '2',
      type: 'sent',
      amount: 0.5,
      token: 'ETH',
      tokenAmount: 0.5,
      usdValue: 1500.25,
      counterpartyAddress: '0x3F2...7B1c',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      status: 'completed',
      hash: '0x3a4b901d3f8ac7e85f479c28dd19b479f985d76a4a4a3834959a9ec08f7d12c2'
    },
    {
      id: '3',
      type: 'swap',
      amount: 100,
      token: 'USDC',
      tokenAmount: 100,
      usdValue: 100.00,
      counterpartyAddress: 'Quantum DEX',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: 'completed',
      hash: '0xf479c28dd19b479f985d76a4a4a3834959a9ec08f7d12c23a4b901d3f8ac7e85'
    },
    {
      id: '4',
      type: 'received',
      amount: 2.75,
      token: 'QNTM',
      tokenAmount: 2.75,
      usdValue: 412.50,
      counterpartyAddress: '0x9B2...F43d',
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
      status: 'completed',
      hash: '0xdd19b479f985d76a4a4a3834959a9ec08f7d12c23a4b901d3f8ac7e85f479c28'
    }
  ];

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 86400; // days
    if (interval > 1) {
      return Math.floor(interval) + "d ago";
    }
    
    interval = seconds / 3600; // hours
    if (interval > 1) {
      return Math.floor(interval) + "h ago";
    }
    
    interval = seconds / 60; // minutes
    if (interval > 1) {
      return Math.floor(interval) + "m ago";
    }
    
    return Math.floor(seconds) + "s ago";
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'received':
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case 'sent':
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case 'swap':
        return <RefreshCw className="h-4 w-4 text-purple-400" />;
      default:
        return <Link className="h-4 w-4 text-blue-400" />;
    }
  };
  
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'received':
        return 'bg-green-900/50 text-green-400';
      case 'sent':
        return 'bg-red-900/50 text-red-400';
      case 'swap':
        return 'bg-purple-900/50 text-purple-400';
      default:
        return 'bg-blue-900/50 text-blue-400';
    }
  };

  return (
    <Card className="bg-black/50 border-purple-500/20 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium flex items-center">
          <Link className="h-5 w-5 text-purple-400 mr-2" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-3 bg-gray-900/30 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${getTransactionColor(transaction.type)} rounded-full flex items-center justify-center mr-3`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="font-medium text-white capitalize">
                      {transaction.type === 'swap' 
                        ? `Swapped ${transaction.amount} ${transaction.token}`
                        : `${transaction.type === 'sent' ? 'Sent' : 'Received'} ${transaction.tokenAmount} ${transaction.token}`}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center">
                      {transaction.type === 'swap' 
                        ? transaction.counterpartyAddress
                        : `${transaction.type === 'sent' ? 'To' : 'From'}: ${transaction.counterpartyAddress}`} • {formatTimeAgo(transaction.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${transaction.type === 'received' ? 'text-green-400' : transaction.type === 'sent' ? 'text-red-400' : 'text-purple-400'}`}>
                    {transaction.type === 'received' ? '+' : transaction.type === 'sent' ? '-' : '↺'} {transaction.tokenAmount} {transaction.token}
                  </div>
                  <div className="text-gray-400 text-xs">{formatCurrency(transaction.usdValue)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center mt-4">
          <Button variant="outline" className="text-xs border-purple-500/30 w-full">
            View All Transactions
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
