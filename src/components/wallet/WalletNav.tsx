
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { Wallet } from "lucide-react";
import { walletTranslations } from "@/lib/translations/languages";
import { formatAddress } from "@/lib/utils";

export function WalletNav() {
  const { isConnected, walletAddress } = useWallet();
  const currentLanguage = "en"; // Default to English if not provided by context
  
  // Get translations based on current language
  const t = (key: string) => {
    return walletTranslations[currentLanguage as keyof typeof walletTranslations]?.[key as keyof typeof walletTranslations[keyof typeof walletTranslations]] || 
           walletTranslations.en[key as keyof typeof walletTranslations.en] || 
           key;
  };
  
  return (
    <div className="flex items-center">
      <Link to="/wallet">
        <Button 
          variant={isConnected ? "default" : "outline"}
          size="sm"
          className={isConnected ? 
            "bg-purple-600 hover:bg-purple-700 text-white" : 
            "border border-purple-500/30 hover:bg-purple-900/20 text-white"
          }
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnected ? formatAddress(walletAddress || '') : t('connect')}
        </Button>
      </Link>
    </div>
  );
}
