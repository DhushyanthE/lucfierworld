
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletOverview } from './WalletOverview';
import { TransactionsSecurity } from './TransactionsSecurity';
import { NetworkStatistics } from './NetworkStatistics';
import { RecentTransactions } from './RecentTransactions';
import { QuantumWalletManager } from './QuantumWalletManager';
import { Wallet, Shield, Activity, Network, RefreshCw } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { toast } from 'sonner';

export function QuantumWalletDashboard() {
  const { isConnected, walletAddress, quantumSecurity } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Simulated refresh function for wallet data
  const refreshWalletData = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Wallet data refreshed');
    }, 2000);
  };
  
  // Check connection status on component mount
  useEffect(() => {
    if (!isConnected) {
      toast.info('Please connect your wallet to view all features');
    }
  }, [isConnected]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Wallet className="h-6 w-6 mr-2 text-purple-400" />
          Quantum Wallet Dashboard
        </h2>
        <button 
          onClick={refreshWalletData}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 px-3 py-1.5 rounded-md text-sm transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      {!isConnected ? (
        <div className="bg-gray-900/50 rounded-lg p-6 text-center border border-purple-500/20">
          <Wallet className="h-12 w-12 mx-auto text-purple-400 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Connect Your Wallet</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-4">
            Please connect your wallet to access quantum-secure wallet features and manage your assets.
          </p>
        </div>
      ) : (
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <Wallet className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="quantum-wallet" className="data-[state=active]:bg-purple-600">
              <Shield className="h-4 w-4 mr-2" />
              Quantum Wallet
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-600">
              <Activity className="h-4 w-4 mr-2" />
              Transaction Security
            </TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-purple-600">
              <Network className="h-4 w-4 mr-2" />
              Network Statistics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WalletOverview />
              </div>
              <div>
                <RecentTransactions />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="quantum-wallet" className="mt-0">
            <QuantumWalletManager />
          </TabsContent>
          
          <TabsContent value="security" className="mt-0">
            <TransactionsSecurity securityStatus={quantumSecurity} />
          </TabsContent>
          
          <TabsContent value="network" className="mt-0">
            <NetworkStatistics />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
