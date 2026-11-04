import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, requireAuth, readJson, handleAuthError } from "../_shared/auth.ts";

const ALLOWED_OPERATIONS = ['aggregate', 'transform', 'analyze', 'predict', 'classify', 'cluster'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only signed-in users may consume the paid AI gateway.
    await requireAuth(req);

    const { operation, dataset, options = {} } = await readJson(req);

    if (!operation || !ALLOWED_OPERATIONS.includes(operation) || !dataset) {
      return new Response(JSON.stringify({ error: 'operation must be one of ' + ALLOWED_OPERATIONS.join(', ') + ' and dataset is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing big data operation:', operation);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

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
            content: `You are a big data processing engine for blockchain-ANN systems.
            Process large-scale datasets efficiently using distributed computing patterns,
            blockchain verification, and neural network analysis. Support operations:
            aggregate, transform, analyze, predict, classify, cluster.`
          },
          {
            role: "user",
            content: `Execute ${operation} on dataset with ${dataset.length || 0} records. Options: ${JSON.stringify(options)}`
          }
        ],
        tools: [
          {
            type: "function",
            name: "process_big_data",
            description: "Process big data with blockchain-ANN integration",
            parameters: {
              type: "object",
              properties: {
                results: {
                  type: "object",
                  properties: {
                    processedRecords: { type: "number" },
                    aggregations: { type: "object" },
                    insights: { type: "array", items: { type: "string" } },
                    patterns: { type: "array", items: { type: "object" } }
                  }
                },
                performance: {
                  type: "object",
                  properties: {
                    throughput: { type: "number" },
                    latency: { type: "number" },
                    blockchainVerifications: { type: "number" }
                  }
                }
              },
              required: ["results", "performance"],
              additionalProperties: false
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "process_big_data" } }
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const result = JSON.parse(toolCall?.function?.arguments || "{}");

    console.log('Processed', result.results?.processedRecords, 'records');

    return new Response(JSON.stringify({
      success: true,
      operation,
      results: result.results || {},
      performance: result.performance || {},
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Big data processing error:', error);
    return new Response(JSON.stringify({
      error: 'big data processing failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
