
import { Input } from "@/components/ui/input";
import { TokenPrice } from "@/services/exchangeService";

interface TokenInputProps {
  label: string;
  amount: string;
  setAmount: (value: string) => void;
  token: string;
  setToken: (value: string) => void;
  tokenData: Record<string, { balance: string; logo: string; rate: number }>;
  prices: TokenPrice[];
  isLoadingPrices: boolean;
  readOnly?: boolean;
}

export function TokenInput({
  label,
  amount,
  setAmount,
  token,
  setToken,
  tokenData,
  prices,
  isLoadingPrices,
  readOnly = false
}: TokenInputProps) {
  return (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
      <div className="flex justify-between mb-2">
        <label className="text-sm text-gray-300">{label}</label>
        <span className="text-sm text-gray-300">Balance: {tokenData[token].balance}</span>
      </div>
      <div className="flex gap-4">
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="bg-transparent text-2xl text-white outline-none flex-1 border-none"
          readOnly={readOnly}
        />
        <select
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="bg-purple-900/50 text-white px-3 py-1 rounded-lg outline-none border border-purple-500/30"
        >
          {Object.keys(tokenData).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      {isLoadingPrices ? (
        <div className="mt-1 text-xs text-purple-300">Loading latest prices...</div>
      ) : prices.find(p => p.symbol === token) ? (
        <div className="mt-1 text-xs text-purple-300">
          Current price: ${prices.find(p => p.symbol === token)?.price.toFixed(2)}
        </div>
      ) : null}
    </div>
  );
}
