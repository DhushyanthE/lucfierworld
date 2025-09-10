import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { formatAddress, formatCurrency } from '@/lib/utils';
import WalletConnectModal from './WalletConnectModal';
import { walletTranslations } from '@/lib/translations/languages';
import { 
  Wallet, 
  Send,
  Download,
  RefreshCw,
  LogOut,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Mock transactions for UI display
const mockTransactions = [
  {
    id: '1',
    type: 'received',
    amount: 0.05,
    usdValue: 150.25,
    timestamp: new Date().toISOString(),
    from: '0x1234...5678'
  },
  {
    id: '2',
    type: 'sent',
    amount: 0.02,
    usdValue: 60.10,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    to: '0x8765...4321'
  },
  {
    id: '3',
    type: 'received',
    amount: 0.1,
    usdValue: 301.50,
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    from: '0x9876...5432'
  }
];

export default function WalletCard() {
  const { 
    walletAddress, 
    currentWallet, 
    isConnected, 
    disconnectWallet, 
    balance,
  } = useWallet();
  
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [transactions] = useState(mockTransactions);
  const currentLanguage = "en"; // Default to English if not provided by context

  // Get translations based on current language
  const t = (key: string) => {
    return walletTranslations[currentLanguage as keyof typeof walletTranslations]?.[key as keyof typeof walletTranslations[keyof typeof walletTranslations]] || 
           walletTranslations.en[key as keyof typeof walletTranslations.en] || 
           key;
  };

  // Format wallet name
  const getWalletName = () => {
    if (!currentWallet) return '';
    return `${currentWallet.charAt(0).toUpperCase() + currentWallet.slice(1)} ${t('walletConnect')}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return `${t('today')}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    
    // Check if it's yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `${t('yesterday')}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    
    // Otherwise return the date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const refreshBalance = () => {
    setIsRefreshingBalance(true);
    setTimeout(() => {
      setIsRefreshingBalance(false);
    }, 1500);
  };

  return (
    <Card className="bg-black/40 border border-purple-500/30 text-white rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{t('yourWallet')}</h3>
          <div className={`bg-opacity-10 text-xs px-2 py-0.5 rounded flex items-center ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isConnected ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <XCircle className="mr-1 h-3 w-3" />
            )}
            <span>{isConnected ? t('connected') : t('disconnected')}</span>
          </div>
        </div>
        
        {!isConnected ? (
          <div className="border border-dashed border-purple-500/30 rounded-xl p-4 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <Wallet className="h-12 w-12 text-gray-400" />
            </div>
            <h4 className="text-white font-medium mb-2">{t('connectYourWallet')}</h4>
            <p className="text-gray-400 text-sm text-center mb-4">{t('connectDescription')}</p>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button 
                variant="outline" 
                className="wallet-connect-btn border border-purple-500/30 flex flex-col items-center justify-center py-2 h-auto bg-gray-800 hover:bg-gray-700"
                onClick={() => setShowConnectModal(true)}
              >
                <div className="bg-orange-500 p-1 rounded-full mb-1">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/800px-MetaMask_Fox.svg.png" alt="MetaMask" className="w-6 h-6" />
                </div>
                <span className="text-xs">{t('metamask')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="wallet-connect-btn border border-purple-500/30 flex flex-col items-center justify-center py-2 h-auto bg-gray-800 hover:bg-gray-700"
                onClick={() => setShowConnectModal(true)}
              >
                <div className="bg-purple-500 p-1 rounded-full mb-1">
                  <img src="https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/sqzgmbkggvc1uwgapeuy" alt="Phantom" className="w-6 h-6" />
                </div>
                <span className="text-xs">{t('phantom')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="wallet-connect-btn border border-purple-500/30 flex flex-col items-center justify-center py-2 h-auto bg-gray-800 hover:bg-gray-700"
                onClick={() => setShowConnectModal(true)}
              >
                <div className="bg-blue-500 p-1 rounded-full mb-1">
                  <img src="https://trustwallet.com/assets/images/media/assets/trust_platform.svg" alt="Trust Wallet" className="w-6 h-6" />
                </div>
                <span className="text-xs">{t('trust')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="wallet-connect-btn border border-purple-500/30 flex flex-col items-center justify-center py-2 h-auto bg-gray-800 hover:bg-gray-700"
                onClick={() => setShowConnectModal(true)}
              >
                <div className="bg-green-500 p-1 rounded-full mb-1 flex items-center justify-center">
                  <img src="https://walletconnect.com/_next/static/media/hero_walletconnect_logo.b05ce1cf.svg" alt="WalletConnect" className="w-6 h-6" />
                </div>
                <span className="text-xs">{t('walletConnect')}</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
                  <Wallet className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{getWalletName()}</h4>
                  <p className="text-gray-400 text-xs font-mono">{formatAddress(walletAddress || '')}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={disconnectWallet}
                className="text-gray-400 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="border border-purple-500/30 rounded-xl p-4 mb-4 bg-gray-900">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-sm">{t('balance')}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshBalance}
                  disabled={isRefreshingBalance}
                  className="h-6 px-1 text-gray-400 text-xs flex items-center hover:text-purple-400"
                >
                  {isRefreshingBalance ? (
                    <RotateCw className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1 h-3 w-3" />
                  )}
                  <span>{t('refresh')}</span>
                </Button>
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-white">{balance || "0.0"}</span>
                <span className="text-gray-400 text-sm ml-2">QNTM</span>
              </div>
              <div className="text-gray-400 text-sm">≈ {formatCurrency(balance ? parseFloat(balance) * 1.24 : 0)}</div>
            </div>
            
            <div className="border border-purple-500/30 rounded-lg p-3 mb-4 bg-gray-900">
              <h4 className="text-white font-medium mb-3">{t('quickActions')}</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white p-2 flex flex-col items-center justify-center h-auto">
                  <Send className="mb-1 h-4 w-4" />
                  <span className="text-xs">{t('send')}</span>
                </Button>
                <Button variant="outline" className="border-purple-500/30 p-2 flex flex-col items-center justify-center h-auto hover:bg-gray-800">
                  <Download className="mb-1 h-4 w-4" />
                  <span className="text-xs">{t('receive')}</span>
                </Button>
                <Button variant="outline" className="border-purple-500/30 p-2 flex flex-col items-center justify-center h-auto hover:bg-gray-800">
                  <RefreshCw className="mb-1 h-4 w-4" />
                  <span className="text-xs">{t('swap')}</span>
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">{t('recentActivity')}</h4>
              {transactions.map((tx, index) => (
                <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-gray-800/50 rounded transition-colors">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 bg-opacity-10 rounded-full flex items-center justify-center mr-2 ${
                      tx.type === 'received' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.type === 'received' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-white text-sm capitalize">{tx.type}</div>
                      <div className="text-gray-400 text-xs">{formatTimestamp(tx.timestamp)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${tx.type === 'received' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'received' ? '+' : '-'}{tx.amount} QNTM
                    </div>
                    <div className="text-gray-400 text-xs">{formatCurrency(tx.usdValue)}</div>
                  </div>
                </div>
              ))}
              
              <div className="text-center mt-2">
                <Button variant="link" className="text-purple-400 hover:text-purple-300 text-sm">
                  {t('viewAllTransactions')}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <WalletConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />
    </Card>
  );
}
