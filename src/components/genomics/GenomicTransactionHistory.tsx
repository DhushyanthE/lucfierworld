
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCheck, ExternalLink, Lock, Coins, Clock, UserCheck } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { format } from 'date-fns';

interface Transaction {
  txId: string;
  type: 'upload' | 'access';
  timestamp: number;
  blockNumber: number;
  data: {
    sequenceHash: string;
    isPublic: boolean;
    encryptionType: 'standard' | 'quantum';
    tokensEarned: number;
    tokensSpent: number;
  };
}

export function GenomicTransactionHistory() {
  const { walletAddress, isConnected, genomicTransactions, isLoadingTransactions, loadGenomicTransactions } = useWallet();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (isConnected && walletAddress) {
      loadGenomicTransactions();
    }
  }, [isConnected, walletAddress]);

  const filteredTransactions = genomicTransactions.filter(tx => {
    if (activeTab === 'all') return true;
    if (activeTab === 'uploads') return tx.type === 'upload';
    if (activeTab === 'access') return tx.type === 'access';
    return true;
  });

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-2xl font-semibold text-center">Transaction History</div>
            <div className="text-gray-500 text-center mt-2">Connect your wallet to view your genomic data transactions</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/60 border-purple-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-purple-400" />
          Genomic Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="uploads">Data Uploads</TabsTrigger>
            <TabsTrigger value="access">Data Access</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {isLoadingTransactions ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-t-purple-500 border-purple-300/30 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 mt-3">Loading genomic transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 bg-gray-900/50 rounded-lg">
                <FileCheck className="h-16 w-16 text-purple-400/30 mx-auto mb-3" />
                <p className="text-lg font-medium text-white">No transactions found</p>
                <p className="text-gray-400 mt-1">
                  {activeTab === 'uploads' ? 'Upload genomic data to see transactions here' :
                   activeTab === 'access' ? 'Request access to genomic data to see transactions here' :
                   'Your genomic transaction history will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((tx, index) => (
                  <div key={tx.txId} className="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900/70 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {tx.type === 'upload' ? (
                            <Badge className="bg-green-600">Upload</Badge>
                          ) : (
                            <Badge className="bg-blue-600">Access</Badge>
                          )}
                          <span className="text-sm text-gray-300 font-mono">
                            {tx.txId.substring(0, 8)}...{tx.txId.substring(tx.txId.length - 8)}
                          </span>
                          <a 
                            href={`https://etherscan.io/tx/${tx.txId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        
                        <div className="flex gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <Lock className="h-3.5 w-3.5" />
                            <span>{tx.data.encryptionType === 'quantum' ? 'Quantum secured' : 'Standard encryption'}</span>
                          </div>
                          
                          {!tx.data.isPublic && (
                            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Private access</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className={`font-medium ${tx.type === 'upload' ? 'text-green-400' : 'text-amber-400'}`}>
                          {tx.type === 'upload' ? `+${tx.data.tokensEarned}` : `-${tx.data.tokensSpent}`} KTC
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-400">
                      <div className="flex justify-between">
                        <div>Block: #{tx.blockNumber.toLocaleString()}</div>
                        <div className="font-mono">Hash: {tx.data.sequenceHash.substring(0, 16)}...</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
