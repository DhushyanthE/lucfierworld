import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, requireAuth, readJson, handleAuthError } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only signed-in users may consume the paid AI gateway.
    await requireAuth(req);

    const body = await readJson(req);
    const dataPoints = body?.dataPoints;

    // Strict validation: threshold must be a number in [0,1] so it can never
    // carry caller-controlled text into the prompt; quantumEnhanced must be boolean.
    const threshold = typeof body?.threshold === 'number' && Number.isFinite(body.threshold) && body.threshold >= 0 && body.threshold <= 1
      ? body.threshold
      : 0.85;
    const quantumEnhanced = typeof body?.quantumEnhanced === 'boolean' ? body.quantumEnhanced : true;

    if (!dataPoints || !Array.isArray(dataPoints)) {
      return new Response(JSON.stringify({ error: 'dataPoints array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (dataPoints.length > 1000) {
      return new Response(JSON.stringify({ error: 'dataPoints array is too large' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing anomaly detection for', dataPoints.length, 'data points');

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Fixed system prompt: caller input never enters the system message.
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
            Consider: temporal patterns, value distributions, blockchain consensus patterns, and neural network behavior.`
          },
          {
            role: "user",
            // Validated numeric threshold and data points travel as data in the user turn.
            content: JSON.stringify({
              instruction: "Analyze these data points for anomalies.",
              anomalyThreshold: threshold,
              quantumEnhanced,
              dataPoints: dataPoints.slice(0, 100)
            })
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
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Anomaly detection error:', error);
    return new Response(JSON.stringify({
      error: 'anomaly detection failed',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
