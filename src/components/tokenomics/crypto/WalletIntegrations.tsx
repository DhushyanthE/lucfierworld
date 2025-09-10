
import React from "react";
import { Wallet, ShieldCheck, Lock, Globe, Shield } from "lucide-react";
import { useTranslationContext } from "@/contexts/TranslationContext";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";

interface WalletIntegration {
  name: string;
  color: string;
}

interface WalletIntegrationsProps {
  wallets: WalletIntegration[];
  title: string;
  languageCode?: string;
}

export function WalletIntegrations({ wallets, title }: WalletIntegrationsProps) {
  const { t, currentLanguage } = useTranslationContext();
  
  // Custom wallet display for Tamil language
  const getWalletClasses = (wallet: WalletIntegration) => {
    // Special styling for Tamil language
    if (currentLanguage === 'ta') {
      return `bg-gradient-to-r ${wallet.color} p-3 rounded-lg flex items-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border border-purple-400/20`;
    }
    return `bg-gradient-to-r ${wallet.color} p-3 rounded-lg flex items-center gap-2 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer`;
  };

  // Get translated security feature based on wallet type
  const getSecurityFeature = (walletName: string) => {
    switch (walletName) {
      case t('wallet', 'metamask'):
        return t('crypto', 'advancedEncryption');
      case t('wallet', 'trustWallet'):
        return t('security', 'multiLayerSecurity');
      case t('wallet', 'phantom'):
        return t('crypto', 'crossChainSecurity');
      case t('wallet', 'walletConnect'):
        return t('crypto', 'secureCommunication');
      default:
        return t('security', 'keyManagement');
    }
  };
  
  return (
    <div className="bg-gray-800/50 p-5 rounded-lg border border-purple-500/10">
      <h4 className="text-lg font-medium text-purple-400 mb-4 flex items-center">
        <ShieldCheck className="h-5 w-5 mr-2" />
        {title}
      </h4>
      
      <div className="grid grid-cols-2 gap-3">
        {wallets.map((wallet, index) => (
          <HoverCard key={index}>
            <HoverCardTrigger asChild>
              <div 
                className={getWalletClasses(wallet)}
              >
                <div className="bg-white/20 rounded-full p-2">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <span className="text-white text-sm font-medium">{wallet.name}</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-72 p-4 bg-gray-900 border border-purple-500/30 text-white">
              <div className="space-y-2">
                <h5 className="font-medium text-purple-400 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {wallet.name} {t('wallet', 'walletSecurity')}
                </h5>
                <p className="text-sm text-gray-300">
                  {getSecurityFeature(wallet.name)}
                </p>
                <div className="pt-2 border-t border-gray-700 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{t('wallet', 'walletNetwork')}:</span>
                    <span className="font-medium text-purple-300">
                      {index % 2 === 0 ? 'Ethereum' : 'Multi-chain'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-400">{t('security', 'securityScore')}:</span>
                    <div className="flex items-center">
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden mr-1">
                        <div 
                          className="h-full bg-purple-500"
                          style={{ width: `${85 + index * 5}%` }}
                        ></div>
                      </div>
                      <span className="text-purple-300">{85 + index * 5}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex items-center mt-1">
                  <Lock className="h-3 w-3 mr-1" />
                  <span>{t('security', 'quantumResistant')}</span>
                </div>
                <div className="text-xs text-gray-400 flex items-center">
                  <Globe className="h-3 w-3 mr-1" />
                  <span>{t('security', 'languageSupport')}</span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  );
}
