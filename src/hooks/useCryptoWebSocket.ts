import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export interface CryptoPriceData {
  symbol: string;
  price: number;
  percentChange24h: number;
  percentChange7d: number;
  marketCap: number;
  volume24h: number;
}

interface WebSocketMessage {
  type: string;
  data?: CryptoPriceData[];
  timestamp?: string;
  source?: 'live' | 'cache' | 'mock';
  message?: string;
}

interface UseCryptoWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  prices: CryptoPriceData[];
  priceHistory: Map<string, number[]>;
  lastUpdate: Date | null;
  updateCount: number;
  source: 'live' | 'cache' | 'mock' | null;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  requestRefresh: () => void;
}

const WS_URL = 'wss://lttxaakpruqqgqdlwpki.functions.supabase.co/functions/v1/crypto-realtime-ws';
const MAX_HISTORY_LENGTH = 60; // Keep last 60 price points per symbol
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;
const PING_INTERVAL = 30000;

export function useCryptoWebSocket(): UseCryptoWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [prices, setPrices] = useState<CryptoPriceData[]>([]);
  const [priceHistory, setPriceHistory] = useState<Map<string, number[]>>(new Map());
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [source, setSource] = useState<'live' | 'cache' | 'mock' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, [clearTimers]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (isConnecting) {
      console.log('Connection already in progress');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log('Connecting to Crypto WebSocket:', WS_URL);
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log('Crypto WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttempts.current = 0;

        toast.success('Real-time crypto prices connected');

        // Subscribe to price updates
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          symbols: ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'QNTM']
        }));

        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, PING_INTERVAL);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'price_update':
              if (message.data) {
                setPrices(message.data);
                setLastUpdate(new Date());
                setUpdateCount(prev => prev + 1);
                setSource(message.source || null);

                // Update price history
                setPriceHistory(prev => {
                  const newHistory = new Map(prev);
                  message.data?.forEach(crypto => {
                    const history = newHistory.get(crypto.symbol) || [];
                    const updatedHistory = [...history, crypto.price].slice(-MAX_HISTORY_LENGTH);
                    newHistory.set(crypto.symbol, updatedHistory);
                  });
                  return newHistory;
                });
              }
              break;

            case 'subscribed':
              console.log('Subscribed to crypto prices:', message);
              break;

            case 'pong':
              // Connection is alive
              break;

            case 'error':
              console.error('WebSocket error message:', message.message);
              setError(message.message || 'Unknown error');
              break;
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('Crypto WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        clearTimers();

        // Attempt reconnection
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          const delay = RECONNECT_DELAY * reconnectAttempts.current;
          console.log(`Attempting reconnection in ${delay}ms (attempt ${reconnectAttempts.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('Maximum reconnection attempts reached');
          toast.error('Failed to maintain crypto price connection');
        }
      };

      wsRef.current.onerror = (event) => {
        console.error('Crypto WebSocket error:', event);
        setError('WebSocket connection error');
      };

    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setIsConnecting(false);
      setError('Failed to create WebSocket connection');
    }
  }, [isConnecting, clearTimers]);

  const requestRefresh = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'refresh' }));
      toast.info('Requesting fresh crypto data...');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    prices,
    priceHistory,
    lastUpdate,
    updateCount,
    source,
    error,
    connect,
    disconnect,
    requestRefresh
  };
}
