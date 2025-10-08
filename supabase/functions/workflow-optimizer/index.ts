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
    const { workflow, optimizationGoals = ['speed', 'accuracy', 'cost'] } = await req.json();
    
    if (!workflow) {
      throw new Error('workflow configuration is required');
    }

    console.log('Optimizing workflow with goals:', optimizationGoals);

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
            content: `You are an advanced off-chain workflow optimizer for blockchain-ANN systems. 
            Optimize workflows by analyzing resource allocation, parallelization opportunities, 
            quantum computing integration points, and blockchain verification strategies.
            Goals: ${optimizationGoals.join(', ')}.`
          },
          {
            role: "user",
            content: `Optimize this workflow: ${JSON.stringify(workflow)}`
          }
        ],
        tools: [
          {
            type: "function",
            name: "optimize_workflow",
            description: "Generate optimized workflow configuration",
            parameters: {
              type: "object",
              properties: {
                optimizedSteps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      type: { type: "string" },
                      parallelizable: { type: "boolean" },
                      quantumEnabled: { type: "boolean" },
                      estimatedTime: { type: "number" },
                      priority: { type: "number" }
                    }
                  }
                },
                improvements: {
                  type: "object",
                  properties: {
                    speedGain: { type: "number" },
                    costReduction: { type: "number" },
                    accuracyImprovement: { type: "number" },
                    parallelizationFactor: { type: "number" }
                  }
                },
                recommendations: {
                  type: "array",
                  items: { type: "string" }
                }
              },
              required: ["optimizedSteps", "improvements"],
              additionalProperties: false
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "optimize_workflow" } }
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    const result = JSON.parse(toolCall?.function?.arguments || "{}");

    console.log('Workflow optimized with', result.improvements?.speedGain, 'speed gain');

    return new Response(JSON.stringify({
      success: true,
      optimizedWorkflow: result.optimizedSteps || [],
      improvements: result.improvements || {},
      recommendations: result.recommendations || [],
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Workflow optimization error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
