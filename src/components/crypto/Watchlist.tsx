import React, { useState } from 'react';
import { Star, Plus, Trash2, TrendingUp, TrendingDown, Edit2, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWatchlist } from '@/hooks/useWatchlist';
import { CryptoPrice } from '@/services/cryptoApiService';
import { useAuth } from '@/hooks/useAuth';

interface WatchlistProps {
  currentPrices: CryptoPrice[];
  availableSymbols: string[];
  onSelectToken?: (symbol: string) => void;
}

export function Watchlist({ currentPrices, availableSymbols, onSelectToken }: WatchlistProps) {
  const { user } = useAuth();
  const { watchlist, isLoading, addToWatchlist, removeFromWatchlist, updateNotes } = useWatchlist();
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');

  // Get price data for a symbol
  const getPriceData = (symbol: string) => {
    return currentPrices.find(p => p.symbol.toUpperCase() === symbol.toUpperCase());
  };

  const handleAddSymbol = async () => {
    if (selectedSymbol) {
      await addToWatchlist(selectedSymbol);
      setSelectedSymbol('');
    }
  };

  const handleStartEditNotes = (symbol: string, currentNotes: string | null) => {
    setEditingNotes(symbol);
    setNotesInput(currentNotes || '');
  };

  const handleSaveNotes = async (symbol: string) => {
    await updateNotes(symbol, notesInput);
    setEditingNotes(null);
    setNotesInput('');
  };

  const handleCancelEditNotes = () => {
    setEditingNotes(null);
    setNotesInput('');
  };

  if (!user) {
    return (
      <Card className="bg-gray-900/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Watchlist
          </CardTitle>
          <CardDescription>Sign in to track your favorite cryptocurrencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-12 w-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">Please sign in to use the watchlist feature</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Watchlist
        </CardTitle>
        <CardDescription>Track your favorite cryptocurrencies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add to watchlist */}
        <div className="flex gap-2">
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="flex-grow bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select a coin to add" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {availableSymbols
                .filter(s => !watchlist.some(w => w.symbol === s.toUpperCase()))
                .map(symbol => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddSymbol}
            disabled={!selectedSymbol}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Watchlist items */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-12 w-12 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">Your watchlist is empty</p>
            <p className="text-gray-500 text-sm mt-1">Add coins to track them here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {watchlist.map(item => {
              const priceData = getPriceData(item.symbol);
              const isEditing = editingNotes === item.symbol;
              
              return (
                <div
                  key={item.id}
                  className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 hover:border-purple-500/30 transition-colors cursor-pointer"
                  onClick={() => onSelectToken?.(item.symbol)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <div>
                        <span className="font-semibold text-white">{item.symbol}</span>
                        {priceData && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-400">
                              ${priceData.price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: priceData.price < 1 ? 6 : 2,
                              })}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                priceData.change24h >= 0
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}
                            >
                              {priceData.change24h >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {priceData.change24h >= 0 ? '+' : ''}
                              {priceData.change24h.toFixed(2)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEditNotes(item.symbol, item.notes);
                        }}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-purple-400"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(item.symbol);
                        }}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Notes section */}
                  {isEditing ? (
                    <div className="mt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Add a note..."
                        className="flex-grow bg-gray-700 border-gray-600 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveNotes(item.symbol)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEditNotes}
                        className="text-gray-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : item.notes ? (
                    <p className="mt-2 text-xs text-gray-500 italic">{item.notes}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
