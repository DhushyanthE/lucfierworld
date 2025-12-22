import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      throw new Error('prompt is required');
    }

    console.log('Trading bot request received');
    
    // Use Lovable AI instead of direct OpenAI calls
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a crypto trading assistant for Quantum Coin. Your task is to analyze market conditions and generate trading signals. Respond with BUY or SELL recommendations for QTC tokens. Always include a confidence level and brief reasoning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_trade_signal',
              description: 'Generate a trading signal with analysis',
              parameters: {
                type: 'object',
                properties: {
                  signal: { type: 'string', enum: ['BUY', 'SELL', 'HOLD'] },
                  confidence: { type: 'number', minimum: 0, maximum: 1 },
                  reasoning: { type: 'string' },
                  suggestedPrice: { type: 'number' },
                  riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] }
                },
                required: ['signal', 'confidence', 'reasoning']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_trade_signal' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the tool call result
    let tradeSignal;
    try {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        tradeSignal = JSON.parse(toolCall.function.arguments);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback response
      tradeSignal = {
        signal: 'HOLD',
        confidence: 0.5,
        reasoning: 'Unable to analyze market conditions at this time'
      };
    }

    // Generate mock price if not provided
    if (!tradeSignal.suggestedPrice) {
      tradeSignal.suggestedPrice = 1000 + Math.random() * 500;
    }

    return new Response(JSON.stringify({
      success: true,
      signal: {
        type: tradeSignal.signal,
        symbol: 'QTC',
        price: tradeSignal.suggestedPrice,
        confidence: tradeSignal.confidence,
        timestamp: Date.now()
      },
      rawResponse: tradeSignal.reasoning,
      riskLevel: tradeSignal.riskLevel || 'medium'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Trading bot error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
