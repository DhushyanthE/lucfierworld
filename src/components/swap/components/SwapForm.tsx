import { ArrowDownUp } from "lucide-react";
import { TokenInput } from "./TokenInput";
import { SwapSettings } from "./SwapSettings";
import { SwapDetails } from "./SwapDetails";
import { SwapFooter } from "./SwapFooter";
import { tokenData } from "../hooks/useSwapLogic";

interface SwapFormProps {
  fromAmount: string;
  setFromAmount: (value: string) => void;
  toAmount: string;
  fromToken: string;
  setFromToken: (value: string) => void;
  toToken: string;
  setToToken: (value: string) => void;
  slippage: string;
  setSlippage: (value: string) => void;
  showSettings: boolean;
  setShowSettings: (value: boolean) => void;
  isLoading: boolean;
  prices: any[];
  isLoadingPrices: boolean;
  handleFlipTokens: () => void;
  handleSwap: (e: React.FormEvent) => Promise<boolean>;
  isConnected: boolean;
}

export function SwapForm({
  fromAmount,
  setFromAmount,
  toAmount,
  fromToken,
  setFromToken,
  toToken,
  setToToken,
  slippage,
  setSlippage,
  showSettings,
  setShowSettings,
  isLoading,
  prices,
  isLoadingPrices,
  handleFlipTokens,
  handleSwap,
  isConnected
}: SwapFormProps) {
  return (
    <div className="w-full max-w-md bg-black/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-xl shadow-purple-500/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Swap Tokens</h2>
        <SwapSettings 
          slippage={slippage}
          setSlippage={setSlippage}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />
      </div>

      {!isConnected && (
        <div className="bg-yellow-500/20 text-yellow-200 p-3 rounded-md mb-4 text-sm flex items-start">
          <span>Connect your wallet to swap tokens and access your balances.</span>
        </div>
      )}

      <form onSubmit={handleSwap}>
        <div className="space-y-2">
          <TokenInput 
            label="From"
            amount={fromAmount}
            setAmount={setFromAmount}
            token={fromToken}
            setToken={setFromToken}
            tokenData={tokenData}
            prices={prices}
            isLoadingPrices={isLoadingPrices}
          />

          <button
            type="button"
            onClick={handleFlipTokens}
            className="mx-auto block p-2 hover:bg-purple-900/30 rounded-full transition-colors border border-purple-500/20"
          >
            <ArrowDownUp className="w-5 h-5 text-purple-400" />
          </button>

          <TokenInput 
            label="To"
            amount={toAmount}
            setAmount={() => {}}
            token={toToken}
            setToken={setToToken}
            tokenData={tokenData}
            prices={prices}
            isLoadingPrices={isLoadingPrices}
            readOnly={true}
          />

          <SwapDetails 
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            tokenData={tokenData}
            prices={prices}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !fromAmount || parseFloat(fromAmount) === 0}
          className={`w-full mt-6 px-6 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
            isLoading || !fromAmount || parseFloat(fromAmount) === 0
              ? "bg-purple-500/50 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 transition-colors"
          }`}
        >
          {isLoading ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
              Processing...
            </>
          ) : !isConnected ? (
            "Connect Wallet to Swap"
          ) : (
            "Swap Tokens"
          )}
        </button>
      </form>

      <SwapFooter slippage={slippage} />
    </div>
  );
}
