
import apiClient from './api';
import { toast } from 'sonner';

// Types for exchange data
export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: string;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdated: string;
}

// Exchange service functions
export const exchangeService = {
  // Fetch current token prices
  getPrices: async (symbols: string[] = ['ETH', 'BTC', 'USDT', 'SOL', 'QNTM']): Promise<TokenPrice[]> => {
    try {
      // This would be a real API call in production
      // const response = await apiClient.get('/prices', { params: { symbols: symbols.join(',') } });
      // return response.data;
      
      // Mock implementation for now
      return symbols.map(symbol => ({
        symbol,
        price: mockPriceData[symbol] || 1.0,
        change24h: (Math.random() * 10) - 5, // Random value between -5% and 5%
        volume24h: Math.round(Math.random() * 10000000),
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      toast.error('Failed to fetch token prices');
      console.error('Error fetching prices:', error);
      return [];
    }
  },
  
  // Fetch order book data
  getOrderBook: async (symbol: string): Promise<OrderBook> => {
    try {
      // This would be a real API call in production
      // const response = await apiClient.get(`/orderbook/${symbol}`);
      // return response.data;
      
      // Mock implementation for now
      const mockOrderBook: OrderBook = {
        bids: Array.from({ length: 10 }, (_, i) => ({
          price: mockPriceData[symbol] * (1 - (i * 0.001)),
          amount: Math.random() * 10
        })),
        asks: Array.from({ length: 10 }, (_, i) => ({
          price: mockPriceData[symbol] * (1 + (i * 0.001)),
          amount: Math.random() * 10
        })),
        lastUpdated: new Date().toISOString()
      };
      
      return mockOrderBook;
    } catch (error) {
      toast.error('Failed to fetch order book');
      console.error('Error fetching order book:', error);
      return { bids: [], asks: [], lastUpdated: new Date().toISOString() };
    }
  },
  
  // Execute a trade
  executeTrade: async (fromToken: string, toToken: string, amount: string): Promise<boolean> => {
    try {
      // This would be a real API call in production
      // const response = await apiClient.post('/trade', { fromToken, toToken, amount });
      // return response.data.success;
      
      // Mock implementation for now
      console.log(`Executing trade: ${amount} ${fromToken} -> ${toToken}`);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success with 95% probability
      const isSuccess = Math.random() < 0.95;
      
      if (!isSuccess) {
        toast.error('Trade execution failed. Please try again.');
        return false;
      }
      
      toast.success(`Successfully traded ${amount} ${fromToken} to ${toToken}`);
      return true;
    } catch (error) {
      toast.error('Trade execution failed');
      console.error('Error executing trade:', error);
      return false;
    }
  }
};

// Mock price data for development
const mockPriceData: Record<string, number> = {
  'ETH': 3245.67,
  'BTC': 52368.91,
  'USDT': 1.00,
  'SOL': 124.35,
  'QNTM': 0.10 // Changed from 'SIETK' to 'QNTM' for consistency
};

export default exchangeService;
