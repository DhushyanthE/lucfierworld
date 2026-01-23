import { toast } from 'sonner';
import { MarketData } from '@/types/market';
import { supabase } from '@/integrations/supabase/client';

export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

export interface CryptoOHLCV {
  symbol: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketStats {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  ethDominance: number;
}

class CryptoApiService {
  private useLiveData = true;
  private lastApiCallTime = 0;
  private minCallInterval = 5000; // 5 seconds between API calls

  // Fetch live data from CoinMarketCap via Edge Function
  private async fetchFromEdgeFunction(limit: number = 20): Promise<any> {
    try {
      // Rate limiting
      const now = Date.now();
      if (now - this.lastApiCallTime < this.minCallInterval) {
        console.log('Rate limited, using cached/mock data');
        return null;
      }
      this.lastApiCallTime = now;

      const { data, error } = await supabase.functions.invoke('coinmarketcap-proxy', {
        body: { limit }
      });

      if (error) {
        console.error('Edge function error:', error);
        return null;
      }

      if (data?.success) {
        console.log('Fetched live crypto data:', data.data?.length, 'coins');
        return data;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch from edge function:', error);
      return null;
    }
  }

  private getMockDataForEndpoint(endpoint: string) {
    // Mock data fallback
    if (endpoint.includes('/cryptocurrency/quotes/latest')) {
      return {
        data: {
          BTC: {
            quote: { USD: { price: 52368.91, percent_change_24h: 2.5, volume_24h: 38500000000, market_cap: 1025000000000 } }
          },
          ETH: {
            quote: { USD: { price: 3245.67, percent_change_24h: 1.8, volume_24h: 18700000000, market_cap: 389000000000 } }
          },
          SOL: {
            quote: { USD: { price: 124.35, percent_change_24h: 4.2, volume_24h: 6200000000, market_cap: 54800000000 } }
          },
          QNTM: {
            quote: { USD: { price: 0.10, percent_change_24h: 15.3, volume_24h: 25000000, market_cap: 10000000 } }
          }
        }
      };
    }
    if (endpoint.includes('/cryptocurrency/ohlcv/latest')) {
      return this.generateMockOHLCVData();
    }
    return { data: {} };
  }

  private generateMockOHLCVData() {
    const symbols = ['BTC', 'ETH', 'SOL', 'QNTM'];
    const data: Record<string, any> = {};
    
    symbols.forEach(symbol => {
      const basePrice = this.getBasePriceForSymbol(symbol);
      data[symbol] = {
        quote: {
          USD: {
            open: basePrice * (1 - Math.random() * 0.03),
            high: basePrice * (1 + Math.random() * 0.05),
            low: basePrice * (1 - Math.random() * 0.05),
            close: basePrice,
            volume: this.getVolumeForSymbol(symbol),
            last_updated: new Date().toISOString()
          }
        }
      };
    });
    
    return { data };
  }
  
  private getBasePriceForSymbol(symbol: string): number {
    switch (symbol) {
      case 'BTC': return 52368.91;
      case 'ETH': return 3245.67;
      case 'SOL': return 124.35;
      case 'QNTM': return 0.10;
      default: return 1.0;
    }
  }
  
  private getVolumeForSymbol(symbol: string): number {
    switch (symbol) {
      case 'BTC': return 38500000000;
      case 'ETH': return 18700000000;
      case 'SOL': return 6200000000;
      case 'QNTM': return 25000000;
      default: return 1000000;
    }
  }

  public async getPrices(symbols: string[] = ['BTC', 'ETH', 'SOL', 'QNTM']): Promise<CryptoPrice[]> {
    // Try to fetch live data first
    if (this.useLiveData) {
      const liveData = await this.fetchFromEdgeFunction(100);
      if (liveData?.data) {
        const symbolSet = new Set(symbols.map(s => s.toUpperCase()));
        const prices: CryptoPrice[] = [];
        
        for (const crypto of liveData.data) {
          if (symbolSet.has(crypto.symbol.toUpperCase())) {
            prices.push({
              symbol: crypto.symbol,
              price: crypto.price,
              change24h: crypto.percentChange24h,
              volume24h: crypto.volume24h,
              marketCap: crypto.marketCap,
              lastUpdated: liveData.timestamp
            });
          }
        }
        
        // Add any missing symbols with mock data
        for (const symbol of symbols) {
          if (!prices.find(p => p.symbol.toUpperCase() === symbol.toUpperCase())) {
            const mockData = this.getMockDataForEndpoint('/cryptocurrency/quotes/latest');
            const data = mockData.data[symbol];
            if (data) {
              prices.push({
                symbol,
                price: data.quote.USD.price,
                change24h: data.quote.USD.percent_change_24h,
                volume24h: data.quote.USD.volume_24h,
                marketCap: data.quote.USD.market_cap,
                lastUpdated: new Date().toISOString()
              });
            }
          }
        }
        
        return prices;
      }
    }
    
    // Fallback to mock data
    const response = this.getMockDataForEndpoint('/cryptocurrency/quotes/latest');
    
    return symbols.map(symbol => {
      const data = response.data[symbol];
      return {
        symbol,
        price: data?.quote.USD.price || 0,
        change24h: data?.quote.USD.percent_change_24h || 0,
        volume24h: data?.quote.USD.volume_24h || 0,
        marketCap: data?.quote.USD.market_cap || 0,
        lastUpdated: new Date().toISOString()
      };
    });
  }

  public async getOHLCV(symbols: string[] = ['BTC', 'ETH', 'SOL', 'QNTM'], interval: string = '1d'): Promise<CryptoOHLCV[]> {
    const response = this.generateMockOHLCVData();
    
    const result: CryptoOHLCV[] = [];
    
    symbols.forEach(symbol => {
      if (response.data[symbol]) {
        const ohlcv = response.data[symbol].quote.USD;
        result.push({
          symbol,
          timestamp: new Date(ohlcv.last_updated).getTime(),
          open: ohlcv.open,
          high: ohlcv.high,
          low: ohlcv.low,
          close: ohlcv.close,
          volume: ohlcv.volume
        });
      }
    });
    
    return result;
  }

  public async getHistoricalData(symbol: string, days: number = 30): Promise<MarketData[]> {
    const data: MarketData[] = [];
    const now = Date.now();
    const basePrice = this.getBasePriceForSymbol(symbol);
    const volatility = basePrice * 0.05;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      
      const randomChange = (Math.random() - 0.48) * volatility;
      const trendFactor = 1 + (days - i) * 0.005;
      
      const price = i === days 
        ? basePrice 
        : data[data.length - 1].price + randomChange;
      
      data.push({
        symbol,
        price: price * trendFactor,
        volume: Math.round(Math.random() * 10000 * basePrice),
        timestamp: date.getTime(),
        high: price * (1 + Math.random() * 0.02),
        low: price * (1 - Math.random() * 0.02),
        open: price * (1 + (Math.random() - 0.5) * 0.01),
        close: price * trendFactor
      });
    }
    
    return data;
  }

  public async getMarketStats(): Promise<MarketStats> {
    // Try to calculate from live data
    if (this.useLiveData) {
      const liveData = await this.fetchFromEdgeFunction(20);
      if (liveData?.data) {
        let totalMarketCap = 0;
        let totalVolume = 0;
        let btcMarketCap = 0;
        let ethMarketCap = 0;
        
        for (const crypto of liveData.data) {
          totalMarketCap += crypto.marketCap || 0;
          totalVolume += crypto.volume24h || 0;
          if (crypto.symbol === 'BTC') btcMarketCap = crypto.marketCap || 0;
          if (crypto.symbol === 'ETH') ethMarketCap = crypto.marketCap || 0;
        }
        
        return {
          totalMarketCap,
          totalVolume24h: totalVolume,
          btcDominance: totalMarketCap > 0 ? (btcMarketCap / totalMarketCap) * 100 : 50,
          ethDominance: totalMarketCap > 0 ? (ethMarketCap / totalMarketCap) * 100 : 18
        };
      }
    }
    
    return {
      totalMarketCap: 1428000000000,
      totalVolume24h: 78500000000,
      btcDominance: 51.8,
      ethDominance: 18.4
    };
  }

  public toMarketData(cryptoPrice: CryptoPrice): MarketData {
    return {
      symbol: cryptoPrice.symbol,
      price: cryptoPrice.price,
      volume: cryptoPrice.volume24h,
      timestamp: new Date(cryptoPrice.lastUpdated).getTime(),
      high: cryptoPrice.price * 1.02,
      low: cryptoPrice.price * 0.98,
      open: cryptoPrice.price * 0.995,
      close: cryptoPrice.price
    };
  }

  // Enable/disable live data fetching
  public setUseLiveData(enabled: boolean) {
    this.useLiveData = enabled;
  }
}

export const cryptoApiService = new CryptoApiService();
export default cryptoApiService;
