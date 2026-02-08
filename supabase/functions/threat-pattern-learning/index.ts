import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ThreatPattern {
  type: string;
  severity: string;
  count: number;
  avgFidelity: number;
  successRate: number;
  timePatterns: { hour: number; count: number }[];
}

interface LearningResult {
  patterns: ThreatPattern[];
  insights: string[];
  recommendations: string[];
  riskScore: number;
  confidenceLevel: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { operation, timeRange = '7d' } = await req.json();
    console.log(`Threat pattern learning operation: ${operation}, timeRange: ${timeRange}`);

    // Calculate time range
    const now = new Date();
    const timeRangeMs = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeRange] || 7 * 24 * 60 * 60 * 1000;
    
    const startDate = new Date(now.getTime() - timeRangeMs).toISOString();

    // Fetch historical threat logs
    const { data: logs, error: logsError } = await supabase
      .from('quantum_firewall_logs')
      .select('*')
      .gte('created_at', startDate)
      .in('event_type', ['threat_detected', 'threat_neutralized', 'defense_action', 'scan_completed'])
      .order('created_at', { ascending: false })
      .limit(1000);

    if (logsError) {
      throw new Error(`Failed to fetch logs: ${logsError.message}`);
    }

    console.log(`Analyzing ${logs?.length || 0} historical threat logs`);

    // Aggregate threat patterns
    const patternMap = new Map<string, {
      count: number;
      fidelities: number[];
      successes: number;
      hourCounts: Map<number, number>;
      severities: Map<string, number>;
    }>();

    for (const log of logs || []) {
      const threatType = log.threat_type || 'unknown';
      const severity = log.severity || 'low';
      const fidelity = log.quantum_fidelity || 0;
      const success = log.success !== false;
      const hour = new Date(log.created_at).getHours();

      if (!patternMap.has(threatType)) {
        patternMap.set(threatType, {
          count: 0,
          fidelities: [],
          successes: 0,
          hourCounts: new Map(),
          severities: new Map(),
        });
      }

      const pattern = patternMap.get(threatType)!;
      pattern.count++;
      pattern.fidelities.push(fidelity);
      if (success) pattern.successes++;
      pattern.hourCounts.set(hour, (pattern.hourCounts.get(hour) || 0) + 1);
      pattern.severities.set(severity, (pattern.severities.get(severity) || 0) + 1);
    }

    // Convert to structured patterns
    const patterns: ThreatPattern[] = Array.from(patternMap.entries()).map(([type, data]) => ({
      type,
      severity: Array.from(data.severities.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown',
      count: data.count,
      avgFidelity: data.fidelities.length > 0 
        ? data.fidelities.reduce((a, b) => a + b, 0) / data.fidelities.length 
        : 0,
      successRate: data.count > 0 ? data.successes / data.count : 0,
      timePatterns: Array.from(data.hourCounts.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => b.count - a.count),
    })).sort((a, b) => b.count - a.count);

    // Use Lovable AI for pattern analysis if available
    let aiInsights: string[] = [];
    let aiRecommendations: string[] = [];

    if (lovableApiKey && patterns.length > 0) {
      try {
        const analysisPrompt = `Analyze these cybersecurity threat patterns from a Quantum Firewall system and provide:
1. Key insights about the threat landscape
2. Specific recommendations to improve defense

Threat Patterns:
${patterns.slice(0, 10).map(p => `
- Type: ${p.type}
  Severity: ${p.severity}
  Count: ${p.count}
  Defense Success Rate: ${(p.successRate * 100).toFixed(1)}%
  Peak Hours: ${p.timePatterns.slice(0, 3).map(t => t.hour).join(', ')}
`).join('\n')}

Total threats analyzed: ${logs?.length || 0}
Time range: ${timeRange}

Provide 3-5 insights and 3-5 actionable recommendations. Be specific and technical.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: "You are a cybersecurity AI analyst specializing in quantum computing security and advanced threat detection. Provide concise, actionable analysis."
              },
              { role: "user", content: analysisPrompt }
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "provide_analysis",
                  description: "Provide threat pattern analysis with insights and recommendations",
                  parameters: {
                    type: "object",
                    properties: {
                      insights: {
                        type: "array",
                        items: { type: "string" },
                        description: "Key insights about the threat patterns"
                      },
                      recommendations: {
                        type: "array",
                        items: { type: "string" },
                        description: "Actionable recommendations to improve defense"
                      },
                      riskAssessment: {
                        type: "string",
                        enum: ["low", "medium", "high", "critical"],
                        description: "Overall risk assessment"
                      }
                    },
                    required: ["insights", "recommendations", "riskAssessment"]
                  }
                }
              }
            ],
            tool_choice: { type: "function", function: { name: "provide_analysis" } },
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
          
          if (toolCall?.function?.arguments) {
            const analysis = JSON.parse(toolCall.function.arguments);
            aiInsights = analysis.insights || [];
            aiRecommendations = analysis.recommendations || [];
          }
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
        // Fallback to rule-based insights
        aiInsights = generateRuleBasedInsights(patterns);
        aiRecommendations = generateRuleBasedRecommendations(patterns);
      }
    } else {
      // Fallback to rule-based analysis
      aiInsights = generateRuleBasedInsights(patterns);
      aiRecommendations = generateRuleBasedRecommendations(patterns);
    }

    // Calculate overall risk score
    const criticalCount = patterns.filter(p => p.severity === 'critical').reduce((sum, p) => sum + p.count, 0);
    const highCount = patterns.filter(p => p.severity === 'high').reduce((sum, p) => sum + p.count, 0);
    const totalCount = patterns.reduce((sum, p) => sum + p.count, 0);
    
    const riskScore = Math.min(100, (criticalCount * 10 + highCount * 5) / Math.max(1, totalCount) * 100);
    const avgSuccessRate = patterns.length > 0 
      ? patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length 
      : 1;
    const confidenceLevel = Math.min(1, (logs?.length || 0) / 100) * avgSuccessRate;

    const result: LearningResult = {
      patterns,
      insights: aiInsights,
      recommendations: aiRecommendations,
      riskScore,
      confidenceLevel,
    };

    // Store learning results
    await supabase.from('quantum_firewall_logs').insert({
      session_id: `learning-${Date.now()}`,
      event_type: 'pattern_learning_completed',
      success: true,
      metrics: {
        patternsAnalyzed: patterns.length,
        logsProcessed: logs?.length || 0,
        timeRange,
        riskScore,
        confidenceLevel,
        topThreats: patterns.slice(0, 5).map(p => p.type),
      },
    });

    return new Response(JSON.stringify({
      success: true,
      result,
      meta: {
        logsAnalyzed: logs?.length || 0,
        timeRange,
        analysisTimestamp: new Date().toISOString(),
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Threat pattern learning error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateRuleBasedInsights(patterns: ThreatPattern[]): string[] {
  const insights: string[] = [];
  
  if (patterns.length === 0) {
    return ["No threat patterns detected in the analyzed time period."];
  }

  const topThreat = patterns[0];
  insights.push(`Most frequent threat type: ${topThreat.type} with ${topThreat.count} occurrences.`);

  const criticalPatterns = patterns.filter(p => p.severity === 'critical');
  if (criticalPatterns.length > 0) {
    insights.push(`${criticalPatterns.length} critical severity threat types detected requiring immediate attention.`);
  }

  const lowSuccessPatterns = patterns.filter(p => p.successRate < 0.8);
  if (lowSuccessPatterns.length > 0) {
    insights.push(`${lowSuccessPatterns.length} threat types have defense success rates below 80%, indicating potential vulnerabilities.`);
  }

  const avgFidelity = patterns.reduce((sum, p) => sum + p.avgFidelity, 0) / patterns.length;
  insights.push(`Average quantum fidelity across all threats: ${(avgFidelity * 100).toFixed(1)}%.`);

  return insights;
}

function generateRuleBasedRecommendations(patterns: ThreatPattern[]): string[] {
  const recommendations: string[] = [];

  const lowSuccessPatterns = patterns.filter(p => p.successRate < 0.8);
  if (lowSuccessPatterns.length > 0) {
    recommendations.push(`Strengthen QNN defense layers for ${lowSuccessPatterns.map(p => p.type).join(', ')} threat types.`);
  }

  const peakHours = new Map<number, number>();
  patterns.forEach(p => {
    p.timePatterns.forEach(t => {
      peakHours.set(t.hour, (peakHours.get(t.hour) || 0) + t.count);
    });
  });
  const topHours = Array.from(peakHours.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => hour);
  
  if (topHours.length > 0) {
    recommendations.push(`Increase monitoring intensity during peak threat hours: ${topHours.join(':00, ')}:00.`);
  }

  recommendations.push("Enable aggressive mode during high-risk periods for enhanced threat capture.");
  recommendations.push("Review and update honeypot configurations to improve attractor effectiveness.");
  recommendations.push("Consider adding additional quantum subspaces for improved threat isolation.");

  return recommendations;
}
