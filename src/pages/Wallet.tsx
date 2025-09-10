
import React from 'react';
import Layout from '@/components/Layout';
import { QuantumAICapabilities } from '@/components/ai/QuantumAICapabilities';
import { useWallet } from '@/contexts/wallet-context';
import { QuantumWalletDashboard } from '@/components/wallet/QuantumWalletDashboard';

const Wallet: React.FC = () => {
  const { isConnected } = useWallet();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
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
