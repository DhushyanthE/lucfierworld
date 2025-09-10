
import React from "react";
import { Footer } from "@/components/layout/Footer";
import { LanguageSelector } from "@/components/home/LanguageSelector";
import { Header } from "@/components/home/layout/Header";
import { MainSection } from "@/components/home/layout/MainSection";
import { useHomePage } from "@/hooks/useHomePage";

export function HomeLayout() {
  const {
    showSwap,
    showAIChat,
    showCharts,
    activeTab,
    setActiveTab,
    logoType,
    selectedWallet,
    prices,
    selectedToken,
    isLoadingPrices,
    showWalletDetails,
    handleLogoClick,
    handleConnectWallet,
    handleShowCharts,
    handleShowAIChat,
    handleShowSwap,
    toggleWalletDetails
  } = useHomePage();

  // Create wrapper function with no parameters to match the expected signature
  const handleConnectWalletWrapper = () => {
    handleConnectWallet(""); // Pass default empty string or appropriate default value
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header 
        logoType={logoType}
        onLogoClick={handleLogoClick}
        selectedWallet={selectedWallet}
        onConnectWallet={handleConnectWalletWrapper} // Use the wrapper function
        onShowCharts={handleShowCharts}
        onShowAIChat={handleShowAIChat}
        onShowSwap={handleShowSwap}
        showCharts={showCharts}
        showAIChat={showAIChat}
        showSwap={showSwap}
      />

      <main className="pt-32 pb-20">
        <MainSection 
          showSwap={showSwap}
          showAIChat={showAIChat}
          showCharts={showCharts}
          showWalletDetails={showWalletDetails}
          selectedWallet={selectedWallet}
          prices={prices}
          selectedToken={selectedToken}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onTrySwap={handleShowSwap}
          onConnectWallet={handleConnectWallet}
          onToggleWalletDetails={toggleWalletDetails}
        />
      </main>

      <LanguageSelector />
      <Footer />
    </div>
  );
}
