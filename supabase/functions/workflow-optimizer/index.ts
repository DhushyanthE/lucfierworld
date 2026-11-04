import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, requireAuth, readJson, handleAuthError } from "../_shared/auth.ts";

const DEFAULT_GOALS = ['speed', 'accuracy', 'cost'];
const MAX_GOALS = 8;
const MAX_GOAL_LENGTH = 40;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only signed-in users may consume the paid AI gateway.
    await requireAuth(req);

    const { workflow, optimizationGoals = DEFAULT_GOALS } = await readJson(req);

    if (!workflow) {
      return new Response(JSON.stringify({ error: 'workflow configuration is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validation: goals must be short strings from the caller, but they travel as
    // data in the user turn — never interpolated into the system prompt.
    const goals = Array.isArray(optimizationGoals)
      ? optimizationGoals
          .filter((g: unknown) => typeof g === 'string' && g.length > 0 && g.length <= MAX_GOAL_LENGTH)
          .slice(0, MAX_GOALS)
      : DEFAULT_GOALS;
    if (goals.length === 0) {
      return new Response(JSON.stringify({ error: 'no valid optimization goals supplied' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Optimizing workflow with', goals.length, 'goals');

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
            // Fixed system prompt: caller goals are not interpolated here.
            content: `You are an advanced off-chain workflow optimizer for blockchain-ANN systems.
            Optimize workflows by analyzing resource allocation, parallelization opportunities,
            quantum computing integration points, and blockchain verification strategies.`
          },
          {
            role: "user",
            content: JSON.stringify({
              instruction: "Optimize this workflow according to the listed goals.",
              goals,
              workflow
            })
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
    const authResponse = handleAuthError(error);
    if (authResponse) return authResponse;
    console.error('Workflow optimization error:', error);
    return new Response(JSON.stringify({
      error: 'workflow optimization failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
