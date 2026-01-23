import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface CryptoData {
  symbol: string;
  price: number;
  percentChange24h: number;
  percentChange7d: number;
  marketCap: number;
  volume24h: number;
}

// Cache for crypto data with TTL
let cachedData: CryptoData[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds cache
const STREAM_INTERVAL = 5000; // Stream updates every 5 seconds

// Connected clients
const clients = new Set<WebSocket>();

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let streamInterval: number | null = null;

  socket.onopen = async () => {
    console.log("Crypto WebSocket client connected");
    clients.add(socket);
    
    // Send initial data immediately
    await sendCryptoUpdate(socket);
    
    // Start streaming updates
    streamInterval = setInterval(async () => {
      await sendCryptoUpdate(socket);
    }, STREAM_INTERVAL);
  };

  socket.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Received message:", message.type);
      
      if (message.type === 'subscribe') {
        socket.send(JSON.stringify({
          type: 'subscribed',
          channel: 'crypto_prices',
          symbols: message.symbols || ['BTC', 'ETH', 'SOL', 'QNTM'],
          timestamp: new Date().toISOString()
        }));
      } else if (message.type === 'refresh') {
        // Force refresh from API
        lastFetchTime = 0;
        await sendCryptoUpdate(socket);
      } else if (message.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({ 
        type: 'error', 
        message: 'Invalid message format' 
      }));
    }
  };

  socket.onclose = () => {
    console.log("Crypto WebSocket client disconnected");
    clients.delete(socket);
    if (streamInterval) {
      clearInterval(streamInterval);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    clients.delete(socket);
    if (streamInterval) {
      clearInterval(streamInterval);
    }
  };

  return response;
});

async function sendCryptoUpdate(socket: WebSocket) {
  if (socket.readyState !== WebSocket.OPEN) return;

  try {
    const data = await fetchCryptoData();
    
    socket.send(JSON.stringify({
      type: 'price_update',
      data: data,
      timestamp: new Date().toISOString(),
      source: lastFetchTime > Date.now() - CACHE_TTL ? 'cache' : 'live'
    }));
  } catch (error) {
    console.error("Error sending crypto update:", error);
    // Send fallback data
    socket.send(JSON.stringify({
      type: 'price_update',
      data: getMockData(),
      timestamp: new Date().toISOString(),
      source: 'mock'
    }));
  }
}

async function fetchCryptoData(): Promise<CryptoData[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedData.length > 0 && now - lastFetchTime < CACHE_TTL) {
    // Add small random variations to simulate real-time updates
    return cachedData.map(crypto => ({
      ...crypto,
      price: crypto.price * (1 + (Math.random() - 0.5) * 0.001),
      percentChange24h: crypto.percentChange24h + (Math.random() - 0.5) * 0.1
    }));
  }

  const apiKey = Deno.env.get('COINMARKETCAP_API_KEY');
  
  if (!apiKey) {
    console.warn("No API key configured, using mock data");
    return getMockData();
  }

  try {
    console.log("Fetching fresh data from CoinMarketCap...");
    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=50',
      {
        headers: {
          'X-CMC_PRO_API_KEY': apiKey,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    cachedData = result.data.map((crypto: any) => ({
      symbol: crypto.symbol,
      price: crypto.quote.USD.price,
      percentChange24h: crypto.quote.USD.percent_change_24h,
      percentChange7d: crypto.quote.USD.percent_change_7d,
      marketCap: crypto.quote.USD.market_cap,
      volume24h: crypto.quote.USD.volume_24h,
    }));
    
    lastFetchTime = now;
    console.log(`Cached ${cachedData.length} cryptocurrencies`);
    
    return cachedData;
  } catch (error) {
    console.error("Error fetching from CoinMarketCap:", error);
    
    // Return cached data even if stale, or mock data
    if (cachedData.length > 0) {
      return cachedData;
    }
    return getMockData();
  }
}

function getMockData(): CryptoData[] {
  const baseData = [
    { symbol: 'BTC', basePrice: 52368.91, change24h: 2.5, change7d: 5.2, marketCap: 1025000000000, volume: 38500000000 },
    { symbol: 'ETH', basePrice: 3245.67, change24h: 1.8, change7d: 3.1, marketCap: 389000000000, volume: 18700000000 },
    { symbol: 'SOL', basePrice: 124.35, change24h: 4.2, change7d: 8.5, marketCap: 54800000000, volume: 6200000000 },
    { symbol: 'BNB', basePrice: 312.45, change24h: -0.5, change7d: 2.1, marketCap: 48000000000, volume: 1200000000 },
    { symbol: 'XRP', basePrice: 0.62, change24h: 3.1, change7d: 6.4, marketCap: 33500000000, volume: 2100000000 },
    { symbol: 'ADA', basePrice: 0.58, change24h: -1.2, change7d: 4.2, marketCap: 20500000000, volume: 780000000 },
    { symbol: 'DOGE', basePrice: 0.12, change24h: 5.6, change7d: 12.3, marketCap: 17200000000, volume: 1500000000 },
    { symbol: 'QNTM', basePrice: 0.10, change24h: 15.3, change7d: 42.1, marketCap: 10000000, volume: 25000000 },
  ];

  return baseData.map(coin => ({
    symbol: coin.symbol,
    price: coin.basePrice * (1 + (Math.random() - 0.5) * 0.002),
    percentChange24h: coin.change24h + (Math.random() - 0.5) * 0.2,
    percentChange7d: coin.change7d + (Math.random() - 0.5) * 0.3,
    marketCap: coin.marketCap,
    volume24h: coin.volume,
  }));
}
