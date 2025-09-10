
import axios from 'axios';
import { toast } from 'sonner';
import { MarketData } from '@/types/market';

// API configuration
const API_KEY = "0fcc0912-6c4d-426d-bcda-bb2b7d0c6b48";
const BASE_URL = "https://pro-api.coinmarketcap.com/v1";

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
  private async fetchWithApiKey(endpoint: string, params: Record<string, any> = {}) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        headers: {
          'X-CMC_PRO_API_KEY': API_KEY
        },
        params
      });
      return response.data;
    } catch (error) {
      console.error("API error:", error);
      toast.error("Failed to fetch crypto data");
      // Fallback to mock data
      return this.getMockDataForEndpoint(endpoint);
    }
  }

  private getMockDataForEndpoint(endpoint: string) {
    // Mock data when API fails
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
    const now = Date.now();
    const data = {};
    
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
    try {
      const response = await this.fetchWithApiKey('/cryptocurrency/quotes/latest', {
        symbol: symbols.join(',')
      });
      
      return symbols.map(symbol => {
        const data = response.data[symbol];
        return {
          symbol,
          price: data.quote.USD.price,
          change24h: data.quote.USD.percent_change_24h,
          volume24h: data.quote.USD.volume_24h,
          marketCap: data.quote.USD.market_cap,
          lastUpdated: data.quote.USD.last_updated
        };
      });
    } catch (error) {
      console.error("Error fetching prices:", error);
      return [];
    }
  }

  public async getOHLCV(symbols: string[] = ['BTC', 'ETH', 'SOL', 'QNTM'], interval: string = '1d'): Promise<CryptoOHLCV[]> {
    try {
      const response = await this.fetchWithApiKey('/cryptocurrency/ohlcv/latest', {
        symbol: symbols.join(','),
        convert: 'USD',
        interval
      });
      
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
    } catch (error) {
      console.error("Error fetching OHLCV data:", error);
      return [];
    }
  }

  public async getHistoricalData(symbol: string, days: number = 30): Promise<MarketData[]> {
    // In a real implementation, we would fetch historical data from the API
    // For now, we'll generate mock data
    const data: MarketData[] = [];
    const now = Date.now();
    const basePrice = this.getBasePriceForSymbol(symbol);
    const volatility = basePrice * 0.05; // 5% volatility
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      
      // Generate price with some random movement but with a trend
      const randomChange = (Math.random() - 0.48) * volatility;
      const trendFactor = 1 + (days - i) * 0.005; // Slight upward trend
      
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
    try {
      const response = await this.fetchWithApiKey('/global-metrics/quotes/latest');
      const data = response.data.quote.USD;
      
      return {
        totalMarketCap: data.total_market_cap,
        totalVolume24h: data.total_volume_24h,
        btcDominance: data.btc_dominance,
        ethDominance: data.eth_dominance
      };
    } catch (error) {
      console.error("Error fetching market stats:", error);
      return {
        totalMarketCap: 1428000000000,
        totalVolume24h: 78500000000,
        btcDominance: 51.8,
        ethDominance: 18.4
      };
    }
  }

  // Convert API data to MarketData format
  public toMarketData(cryptoPrice: CryptoPrice): MarketData {
    return {
      symbol: cryptoPrice.symbol,
      price: cryptoPrice.price,
      volume: cryptoPrice.volume24h,
      timestamp: new Date(cryptoPrice.lastUpdated).getTime(),
      high: cryptoPrice.price * 1.02, // Approximation
      low: cryptoPrice.price * 0.98, // Approximation
      open: cryptoPrice.price * 0.995, // Approximation
      close: cryptoPrice.price
    };
  }
}

export const cryptoApiService = new CryptoApiService();
export default cryptoApiService;
