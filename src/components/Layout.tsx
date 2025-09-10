
import React from 'react';
import { NavBar } from "@/components/layout/NavBar";
import { Footer } from "@/components/layout/Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <NavBar 
        logoType="gem"
        onLogoClick={() => {}}
        selectedWallet={null}
        onConnectWallet={() => {}}
        onShowCharts={() => {}}
        onShowAIChat={() => {}}
        onShowSwap={() => {}}
        showCharts={false}
        showAIChat={false}
        showSwap={false}
      />
      <main className="pt-32 pb-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
