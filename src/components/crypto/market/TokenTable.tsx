
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CryptoPrice } from "@/services/cryptoApiService";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrencyWithSuffix } from "@/lib/formatters";

interface TokenTableProps {
  tokens: CryptoPrice[];
}

export function TokenTable({ tokens }: TokenTableProps) {
  return (
    <Card className="bg-gray-900/50 border-purple-500/20 md:col-span-2">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-white mb-4">Token Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-3 text-gray-400">Token</th>
                <th className="pb-3 text-gray-400">Price</th>
                <th className="pb-3 text-gray-400">24h Change</th>
                <th className="pb-3 text-gray-400">Market Cap</th>
                <th className="pb-3 text-gray-400">Volume (24h)</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.symbol} className="border-b border-gray-800">
                  <td className="py-3 font-medium text-white">{token.symbol}</td>
                  <td className="py-3">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: token.price < 1 ? 6 : 2,
                      maximumFractionDigits: token.price < 1 ? 6 : 2,
                    }).format(token.price)}
                  </td>
                  <td className={`py-3 ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                    {token.change24h >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(token.change24h).toFixed(2)}%
                  </td>
                  <td className="py-3">{formatCurrencyWithSuffix(token.marketCap)}</td>
                  <td className="py-3">{formatCurrencyWithSuffix(token.volume24h)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

