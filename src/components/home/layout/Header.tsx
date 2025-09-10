
import React from "react";
import { NavBar } from "@/components/layout/NavBar";
import { LogoIconType } from "@/components/layout/Logo";

interface HeaderProps {
  logoType: LogoIconType;
  onLogoClick: () => void;
  selectedWallet: string | null;
  onConnectWallet: () => void; // Changed to match expected signature
  onShowCharts: () => void;
  onShowAIChat: () => void;
  onShowSwap: () => void;
  showCharts: boolean;
  showAIChat: boolean;
  showSwap: boolean;
}

export function Header({
  logoType,
  onLogoClick,
  selectedWallet,
  onConnectWallet,
  onShowCharts,
  onShowAIChat,
  onShowSwap,
  showCharts,
  showAIChat,
  showSwap
}: HeaderProps) {
  return (
    <NavBar 
      logoType={logoType}
      onLogoClick={onLogoClick}
      selectedWallet={selectedWallet}
      onConnectWallet={onConnectWallet}
      onShowCharts={onShowCharts}
      onShowAIChat={onShowAIChat}
      onShowSwap={onShowSwap}
      showCharts={showCharts}
      showAIChat={showAIChat}
      showSwap={showSwap}
    />
  );
}
