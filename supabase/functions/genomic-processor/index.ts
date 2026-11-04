import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, requireAuth, readJson, handleAuthError } from "../_shared/auth.ts";

const ALLOWED_OPERATIONS = ['analyze', 'variant', 'pattern', 'store', 'predict'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only signed-in users may consume the paid AI gateway.
    await requireAuth(req);

    const {
      genomicData,
      operation = 'analyze',
      blockchainStore = true,
      quantumCircuits = true
    } = await readJson(req);

    if (!genomicData) {
      return new Response(JSON.stringify({ error: 'genomicData is required', success: false }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Allowlisted operation: caller text can never steer the system prompt.
    if (!ALLOWED_OPERATIONS.includes(operation)) {
      return new Response(JSON.stringify({ error: 'unsupported operation', success: false }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing genomic data with operation:', operation);

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
            // Fixed system prompt with only server-controlled values.
            content: `You are a genomic data processor with blockchain-ANN integration and quantum computing capabilities.
            Process genomic sequences, identify patterns, predict variants, and store results on blockchain.
            Use quantum circuits for complex genomic pattern analysis. Operation: ${operation}.
            Blockchain storage: ${blockchainStore ? 'enabled' : 'disabled'}.
            Quantum circuits: ${quantumCircuits ? 'enabled' : 'disabled'}.`
          },
          {
            role: "user",
            content: `Process genomic data: ${JSON.stringify(genomicData).slice(0, 500)}`
          }
        ],
        tools: [
          {
            type: "function",
            name: "process_genomic_data",
            description: "Process genomic data with blockchain-ANN and quantum enhancements",
            parameters: {
              type: "object",
              properties: {
                analysis: {
                  type: "object",
                  properties: {
                    sequenceLength: { type: "number" },
                    geneCount: { type: "number" },
                    variants: { type: "array", items: { type: "object" } },
                    patterns: { type: "array", items: { type: "string" } }
                  }
                },
                blockchain: {
                  type: "object",
                  properties: {
                    txHash: { type: "string" },
                    ipfsHash: { type: "string" },
                    verified: { type: "boolean" }
                  }
                },
                quantumAnalysis: {
                  type: "object",
                  properties: {
                    circuitsUsed: { type: "number" },
                    entanglementScore: { type: "number" },
                    quantumAdvantage: { type: "number" }
                  }
                },
                predictions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      confidence: { type: "number" },
                      location: { type: "string" }
                    }
                  }
                }
              },
              required: ["analysis"],
              additionalProperties: false
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "process_genomic_data" } }
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const result = JSON.parse(toolCall?.function?.arguments || "{}");

    console.log('Genomic analysis complete. Found', result.analysis?.geneCount, 'genes');

    return new Response(JSON.stringify({
      success: true,
      operation,
      analysis: result.analysis || {},
      blockchain: result.blockchain || {},
      quantumAnalysis: result.quantumAnalysis || {},
      predictions: result.predictions || [],
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Genomic processing error:', error);
    return new Response(JSON.stringify({
      error: 'genomic processing failed',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
