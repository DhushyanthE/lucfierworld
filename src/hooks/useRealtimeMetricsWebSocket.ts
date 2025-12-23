import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export interface RealtimeMetrics {
  quantum: {
    coherence: number;
    entanglementFidelity: number;
    gateErrorRate: number;
    qubitCount: number;
    circuitDepth: number;
    measurementFidelity: number;
  };
  agi: {
    confidence: number;
    processingPower: number;
    optimizationScore: number;
    activeModels: number;
    inferenceLatency: number;
  };
  agentic: {
    activeAgents: number;
    totalReward: number;
    agentEfficiency: number;
    annLayerCount: number;
    qLearningProgress: number;
  };
  blockchain: {
    blockHeight: number;
    transactionsPerSecond: number;
    consensusScore: number;
    nodeCount: number;
    gasPrice: number;
  };
  neural: {
    rnnAccuracy: number;
    cnnAccuracy: number;
    trainingLoss: number;
    validationLoss: number;
    throughput: number;
  };
  security: {
    activePatterns: number;
    securityScore: number;
    threatLevel: string;
    lastScanTime: string;
  };
  anomaly: {
    detected: number;
    riskScore: number;
    alertsActive: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    networkLatency: number;
    uptime: number;
  };
}

interface WebSocketMessage {
  type: string;
  data?: RealtimeMetrics;
  timestamp: string;
  channel?: string;
}

export function useRealtimeMetricsWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<Array<{ timestamp: Date; metrics: RealtimeMetrics }>>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (isConnecting) {
      console.log('WebSocket connection in progress');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const wsUrl = `wss://lttxaakpruqqgqdlwpki.functions.supabase.co/functions/v1/realtime-metrics-ws`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectAttempts.current = 0;
        
        toast.success('Real-time metrics connected');

        // Subscribe to all metrics
        wsRef.current?.send(JSON.stringify({
          type: 'subscribe',
          channel: 'all-metrics'
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === 'metrics_update' && message.data) {
            setMetrics(message.data);
            setLastUpdate(new Date(message.timestamp));
            setUpdateCount(prev => prev + 1);
            
            setMetricsHistory(prev => {
              const newEntry = { timestamp: new Date(message.timestamp), metrics: message.data! };
              return [...prev.slice(-99), newEntry];
            });
          } else if (message.type === 'subscribed') {
            console.log('Subscribed to channel:', message.channel);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Attempt reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting reconnection in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          setError('Connection lost. Please refresh to reconnect.');
          toast.error('Real-time connection lost');
        }
      };

      wsRef.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error occurred');
        setIsConnecting(false);
      };

    } catch (e) {
      console.error('Failed to create WebSocket:', e);
      setError('Failed to connect');
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttempts.current = maxReconnectAttempts; // Prevent auto-reconnect
    
    toast.info('Real-time metrics disconnected');
  }, []);

  const requestRefresh = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'refresh' }));
    }
  }, []);

  const clearHistory = useCallback(() => {
    setMetricsHistory([]);
    setUpdateCount(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    metrics,
    metricsHistory,
    lastUpdate,
    updateCount,
    error,
    connect,
    disconnect,
    requestRefresh,
    clearHistory
  };
}
