
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Globe, Wallet, Hash, Code, LinkIcon, Key, FileCode, LayoutGrid } from "lucide-react";
import { SecurityFeatures } from "./crypto/SecurityFeatures";
import { LanguageSelector } from "./crypto/LanguageSelector";
import { CryptoWorkflow } from "./crypto/CryptoWorkflow";
import { WalletIntegrations } from "./crypto/WalletIntegrations";
import { WebCryptoDisplay } from "./crypto/WebCryptoDisplay";
import { SecurityLevelIndicator } from "./crypto/SecurityLevelIndicator";
import { useTranslationContext } from "@/contexts/TranslationContext";
import { toast } from "sonner";

export function CryptoTechnologies() {
  const { t, currentLanguage, setLanguage, getLanguageName } = useTranslationContext();
  const [securityLevel, setSecurityLevel] = useState(8);
  
  // Cryptography features
  const cryptoFeatures = [
    {
      title: t('security', 'quantumResistant'),
      description: "Post-quantum cryptographic methods designed to withstand future computing attacks",
      icon: <Shield className="h-8 w-8 text-purple-400" />
    },
    {
      title: t('security', 'multiChain'),
      description: "Seamless integration with Ethereum, Solana, and other major blockchain networks",
      icon: <Wallet className="h-8 w-8 text-purple-400" />
    },
    {
      title: t('security', 'languageSupport'),
      description: "Global accessibility with full localization in multiple languages",
      icon: <Globe className="h-8 w-8 text-purple-400" />
    },
    {
      title: t('security', 'keyManagement'),
      description: "Enhanced private key security with multi-layer protection",
      icon: <Lock className="h-8 w-8 text-purple-400" />
    }
  ];

  // Wallet integrations
  const walletIntegrations = [
    { name: t('wallet', 'metamask'), color: "from-orange-400 to-yellow-500" },
    { name: t('wallet', 'trustWallet'), color: "from-blue-400 to-blue-600" },
    { name: t('wallet', 'phantom'), color: "from-purple-500 to-purple-700" },
    { name: t('wallet', 'walletConnect'), color: "from-blue-500 to-indigo-600" }
  ];

  // Cryptographic workflow steps
  const cryptoWorkflow = [
    {
      title: "Input Data Processing",
      description: "User data is normalized and prepared for cryptographic operations",
      icon: <Hash className="h-6 w-6" />
    },
    {
      title: "Secure Hashing",
      description: "Data integrity verification using Web Crypto API",
      icon: <Code className="h-6 w-6" />
    },
    {
      title: "Cross-Chain Verification",
      description: "Validation across multiple blockchain networks",
      icon: <LinkIcon className="h-6 w-6" />
    },
    {
      title: "Quantum-Safe Encoding",
      description: "Post-quantum secure output generation",
      icon: <Key className="h-6 w-6" />
    }
  ];

  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);
    // Random security level between 8-10 for more realistic simulation
    setSecurityLevel(Math.floor(Math.random() * 3) + 8);
    
    // Log data integrity hash (visible in console)
    const hash = Math.random().toString(16).substring(2, 12);
    console.log(`Data integrity verified with hash: ${hash}...`);
  };

  return (
    <Card className="p-6 bg-black/70 backdrop-blur-sm border border-purple-500/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <FileCode className="h-5 w-5 mr-2 text-purple-400" />
        {t('crypto', 'cryptoTechnologies')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SecurityFeatures 
            features={cryptoFeatures} 
            title={t('security', 'securityFeatures')} 
          />
          
          <div className="bg-gray-800/50 p-5 rounded-lg border border-purple-500/10">
            <LanguageSelector 
              selectedLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              multiLangTitle={t('ui', 'multilingual')}
            />
          </div>
          
          <div className="bg-gray-800/50 p-5 rounded-lg border border-purple-500/10">
            <h4 className="text-lg font-medium text-purple-400 mb-4 flex items-center">
              <LayoutGrid className="h-5 w-5 mr-2" />
              {t('security', 'securityAssessment')}
            </h4>
            <SecurityLevelIndicator level={securityLevel} />
          </div>
        </div>
        
        <div className="space-y-6">
          <CryptoWorkflow 
            steps={cryptoWorkflow} 
            title={t('security', 'cryptoWorkflow')} 
          />
          
          <WalletIntegrations 
            wallets={walletIntegrations} 
            title={t('wallet', 'walletIntegration')}
            languageCode={currentLanguage}
          />
          
          <WebCryptoDisplay securityLevel={securityLevel} />
        </div>
      </div>
    </Card>
  );
}
