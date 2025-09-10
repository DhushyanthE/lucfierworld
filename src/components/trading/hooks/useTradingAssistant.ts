
import { useState } from 'react';
import { TradeSignal } from '@/types/trade';
import { tradingBotService } from '@/services/tradingBotService';
import { toast } from '@/components/ui/use-toast';

export function useTradingAssistant() {
  const [prompt, setPrompt] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signal, setSignal] = useState<TradeSignal | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const generateOfflineSignal = (userPrompt: string): TradeSignal => {
    // Generate deterministic but pseudo-random signal based on prompt content
    const isBuy = userPrompt.length % 2 === 0;
    
    return {
      type: isBuy ? 'BUY' : 'SELL',
      symbol: 'QTC',
      price: 1200 + (userPrompt.length % 500),
      confidence: 0.65 + (userPrompt.length % 10) / 100,
      timestamp: Date.now(),
    };
  };

  const generateOfflineAnalysis = (userPrompt: string): string => {
    if (userPrompt.toLowerCase().includes('market')) {
      return "Quantum Coin market analysis (offline mode): The current market conditions show moderate volatility with support levels holding strong. Volume has been steady with minor fluctuations throughout the trading session.";
    } else if (userPrompt.toLowerCase().includes('trend')) {
      return "Quantum Coin trend analysis (offline mode): Recent price action shows a consolidation pattern with potential for an upward breakout if volume increases. Key technical indicators suggest accumulation phase may be nearing completion.";
    } else if (userPrompt.toLowerCase().includes('buy') || userPrompt.toLowerCase().includes('sell')) {
      return "Trading recommendation (offline mode): Consider position sizing based on your risk tolerance. The current risk-to-reward ratio suggests small position entries with tight stop losses may be optimal in current market conditions.";
    } else {
      return "Offline analysis: Based on historical patterns and technical indicators, Quantum Coin shows potential for short-term movements within its established range. Monitor key support/resistance levels at 1150 and 1350 for potential breakout opportunities.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First check for network connectivity
      const onlineStatus = navigator.onLine;
      setIsOfflineMode(!onlineStatus);
      
      if (!onlineStatus) {
        // Generate offline response
        const offlineSignal = generateOfflineSignal(prompt);
        const offlineAnalysis = generateOfflineAnalysis(prompt);
        
        setLastResponse(offlineAnalysis);
        setSignal(offlineSignal);
        
        toast({
          title: "Offline Mode Active",
          description: "Using locally generated trading signals"
        });
      } else {
        // Attempt online API request
        const result = await tradingBotService.generateTradeSignal(prompt);
        
        if (result.success) {
          setLastResponse(result.rawResponse);
          if (result.signal) {
            setSignal(result.signal);
          }
        } else {
          // Fall back to offline mode if API fails
          setIsOfflineMode(true);
          setError("API connection failed. Switched to offline mode.");
          
          const offlineSignal = generateOfflineSignal(prompt);
          const offlineAnalysis = generateOfflineAnalysis(prompt);
          
          setLastResponse(offlineAnalysis);
          setSignal(offlineSignal);
          
          toast({
            title: "API Connection Failed",
            description: "Using locally generated trading signals instead"
          });
        }
      }
    } catch (err) {
      console.error("Error in trading assistant:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      
      // Fall back to offline mode
      setIsOfflineMode(true);
      const offlineSignal = generateOfflineSignal(prompt);
      const offlineAnalysis = generateOfflineAnalysis(prompt);
      
      setLastResponse(offlineAnalysis);
      setSignal(offlineSignal);
      
      toast({
        title: "Error Processing Request",
        description: "Switched to offline mode with local signals"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    prompt,
    setPrompt,
    lastResponse,
    isLoading,
    error,
    signal,
    isOfflineMode,
    handleSubmit
  };
}
