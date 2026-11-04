import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, requireAuth, handleAuthError } from "../_shared/auth.ts";

interface CryptoQuote {
  price: number;
  percent_change_24h: number;
  percent_change_7d: number;
  market_cap: number;
  volume_24h: number;
}

interface CryptoData {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: CryptoQuote;
  };
}

const ALLOWED_CONVERTS = ['USD', 'EUR', 'GBP', 'JPY', 'BTC', 'ETH', 'INR'];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // The paid CoinMarketCap API key must only be reachable by signed-in users.
    const { userId } = await requireAuth(req);
    console.log('Authenticated request from:', userId);

    // Get the API key from environment
    const apiKey = Deno.env.get('COINMARKETCAP_API_KEY');
    if (!apiKey) {
      console.error('COINMARKETCAP_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body for optional parameters
    let limit = 20;
    let convert = 'USD';

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.limit) limit = Math.min(Math.max(1, Number(body.limit) || 20), 100);
        if (typeof body.convert === 'string' && ALLOWED_CONVERTS.includes(body.convert.toUpperCase())) {
          convert = body.convert.toUpperCase();
        }
      } catch {
        // Use defaults if body parsing fails
      }
    }

    console.log(`Fetching top ${limit} cryptocurrencies in ${convert}`);

    // Call CoinMarketCap API
    const cmcUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=${limit}&convert=${convert}`;

    const response = await fetch(cmcUrl, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CoinMarketCap API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch cryptocurrency data' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.data?.length || 0} cryptocurrencies`);

    // Transform the response to a cleaner format
    const transformedData = data.data.map((crypto: CryptoData) => ({
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      price: crypto.quote.USD.price,
      percentChange24h: crypto.quote.USD.percent_change_24h,
      percentChange7d: crypto.quote.USD.percent_change_7d,
      marketCap: crypto.quote.USD.market_cap,
      volume24h: crypto.quote.USD.volume_24h,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: transformedData,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
