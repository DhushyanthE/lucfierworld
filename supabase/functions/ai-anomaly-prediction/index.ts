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
    const { metrics, historicalData } = await req.json();
    
    console.log('AI Anomaly Prediction request received');
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prepare the prompt for anomaly prediction
    const systemPrompt = `You are an AI anomaly detection and prediction system for a quantum-blockchain infrastructure. 
Analyze the provided metrics and predict potential anomalies. Return your analysis in JSON format with:
- predictions: array of predicted anomalies with fields: type, probability, severity (low/medium/high/critical), description, timeframe
- riskScore: overall risk score from 0 to 1
- recommendations: array of actionable recommendations
- insights: array of key observations about the data patterns`;

    const userPrompt = `Analyze these system metrics for anomalies and predict future issues:

Current Metrics:
${JSON.stringify(metrics, null, 2)}

Historical Data Points (last ${historicalData?.length || 0} readings):
${JSON.stringify(historicalData?.slice(-10) || [], null, 2)}

Provide comprehensive anomaly prediction and analysis.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'anomaly_prediction',
              description: 'Return structured anomaly predictions and analysis',
              parameters: {
                type: 'object',
                properties: {
                  predictions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        probability: { type: 'number' },
                        severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
                        description: { type: 'string' },
                        timeframe: { type: 'string' }
                      },
                      required: ['type', 'probability', 'severity', 'description', 'timeframe']
                    }
                  },
                  riskScore: { type: 'number' },
                  recommendations: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  insights: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                },
                required: ['predictions', 'riskScore', 'recommendations', 'insights']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'anomaly_prediction' } }
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
    let predictions;
    try {
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        predictions = JSON.parse(toolCall.function.arguments);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback predictions
      predictions = {
        predictions: [],
        riskScore: 0.3,
        recommendations: ['Continue monitoring system metrics'],
        insights: ['System appears to be operating normally']
      };
    }

    return new Response(JSON.stringify({
      success: true,
      predictions,
      timestamp: new Date().toISOString(),
      model: 'google/gemini-2.5-flash'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI anomaly prediction error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
