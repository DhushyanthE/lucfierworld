import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for authorization - allow both authenticated and unauthenticated access
    // The API key is protected server-side, so unauthenticated users can still view prices
    const authHeader = req.headers.get('Authorization');
    let userId = 'anonymous';
    
    if (authHeader?.startsWith('Bearer ')) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData } = await supabase.auth.getClaims(token);
      
      // If we get valid claims with a sub, user is authenticated
      if (claimsData?.claims?.sub) {
        userId = claimsData.claims.sub;
        console.log('Authenticated user:', userId);
      } else {
        console.log('Unauthenticated request (anon key or invalid token)');
      }
    } else {
      console.log('No authorization header - anonymous request');
    }

    console.log('Request from:', userId);

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
        if (body.limit) limit = Math.min(Math.max(1, body.limit), 100);
        if (body.convert) convert = body.convert;
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
        JSON.stringify({ error: 'Failed to fetch cryptocurrency data', details: response.statusText }),
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
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
