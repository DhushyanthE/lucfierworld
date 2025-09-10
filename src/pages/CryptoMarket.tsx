
import React from "react";
import Layout from '@/components/Layout';
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";
import { MarketDashboard } from "@/components/crypto/MarketDashboard";
import { useWallet } from "@/hooks/use-wallet";

export default function CryptoMarket() {
  const { currentWallet, connectWallet } = useWallet(); 
  
  // Create wrapper function to match expected signature
  const handleConnectWallet = () => {
    // You can implement the necessary wallet connection logic here
    // that doesn't require the walletType parameter
    console.log("Connect wallet button clicked");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <NavBar 
          logoType="gem" // Use a valid logo type
          onLogoClick={() => {}}
          selectedWallet={currentWallet || null}
          onConnectWallet={handleConnectWallet} // Use our wrapper function
          onShowCharts={() => {}}
          onShowAIChat={() => {}}
          onShowSwap={() => {}}
          showCharts={false}
          showAIChat={false}
          showSwap={false}
        />
        
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
              <span className="bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                Quantum-Enhanced Crypto Market Analysis
              </span>
            </h1>
            
            {/* Pass the onConnectWallet prop as expected by MarketDashboard */}
            <MarketDashboard 
              onConnectWallet={handleConnectWallet}
            />
          </div>
        </main>
        
        <Footer />
      </div>
    </Layout>
  );
}
