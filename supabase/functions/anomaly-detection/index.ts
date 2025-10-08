import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data: dataPoints, threshold = 0.85, quantumEnhanced = true } = await req.json();
    
    if (!dataPoints || !Array.isArray(dataPoints)) {
      throw new Error('dataPoints array is required');
    }

    console.log('Processing anomaly detection for', dataPoints.length, 'data points');

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Quantum-enhanced anomaly detection using AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a quantum-enhanced anomaly detection system for blockchain-ANN networks. 
            Analyze data patterns and identify anomalies using advanced statistical methods and quantum-inspired algorithms.
            Consider: temporal patterns, value distributions, blockchain consensus patterns, and neural network behavior.
            Threshold for anomaly: ${threshold}. Quantum enhancement: ${quantumEnhanced ? 'enabled' : 'disabled'}.`
          },
          {
            role: "user",
            content: `Analyze these data points for anomalies: ${JSON.stringify(dataPoints.slice(0, 100))}`
          }
        ],
        tools: [
          {
            type: "function",
            name: "detect_anomalies",
            description: "Detect anomalies in blockchain-ANN data",
            parameters: {
              type: "object",
              properties: {
                anomalies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "number" },
                      severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                      confidence: { type: "number" },
                      reason: { type: "string" },
                      quantumScore: { type: "number" }
                    }
                  }
                },
                statistics: {
                  type: "object",
                  properties: {
                    totalAnomalies: { type: "number" },
                    averageConfidence: { type: "number" },
                    quantumEnhancementFactor: { type: "number" }
                  }
                }
              },
              required: ["anomalies", "statistics"],
              additionalProperties: false
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "detect_anomalies" } }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const result = JSON.parse(toolCall?.function?.arguments || "{}");

    console.log('Detected', result.statistics?.totalAnomalies, 'anomalies');

    return new Response(JSON.stringify({
      success: true,
      anomalies: result.anomalies || [],
      statistics: result.statistics || {},
      quantumEnhanced,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Anomaly detection error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
