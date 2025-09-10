
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertCircle, TrendingUp, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/use-wallet';
import { useTradingAssistant } from './hooks/useTradingAssistant';
import { TradeForm } from './components/TradeForm';
import { SignalDisplay } from './components/SignalDisplay';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { ConnectionWarning } from './components/ConnectionWarning';
import { WalletWarning } from './components/WalletWarning';

export function TradingAssistant() {
  const { isConnected } = useWallet();
  const {
    prompt,
    setPrompt,
    lastResponse,
    isLoading,
    error,
    signal,
    isOfflineMode,
    handleSubmit
  } = useTradingAssistant();

  return (
    <Card className="bg-white/90 border-purple-300/40 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-800 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
          Quantum Trading Assistant
          {isOfflineMode && (
            <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
              <WifiOff className="w-3 h-3 mr-1" /> Offline Mode
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected && <WalletWarning />}
        
        <TradeForm 
          prompt={prompt}
          setPrompt={setPrompt}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
        
        {error && <ConnectionWarning message={error} />}
        
        {signal && <SignalDisplay signal={signal} isOfflineMode={isOfflineMode} />}
        
        {lastResponse && !error && <AnalysisDisplay analysis={lastResponse} />}
      </CardContent>
      <CardFooter className="border-t border-purple-300/20 pt-4 text-xs text-gray-500">
        Powered by Quantum AI {isOfflineMode ? '(Offline Mode)' : '& OpenAI'}
      </CardFooter>
    </Card>
  );
}
