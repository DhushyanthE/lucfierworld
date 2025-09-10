
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Network, BarChart4, Lightbulb, Infinity } from 'lucide-react';
import { agiModule } from '@/lib/quantum/AGIModule';
import { superAIModule } from '@/lib/quantum/SuperAIModule';

// Define interfaces for metrics that include all required properties
interface ProcessingMetrics {
  cognitiveCapacity: number;
  quantumAdvantage: number;
  neuronsEquivalent: number;
  circuitDepth: number;
  totalDecisions: number;
  averageConfidence: number;
  systemComplexity: number;
  adaptabilityScore: number;
}

interface IntelligenceMetrics {
  intelligenceQuotient: number;
  processingCapacity: number;
  learningRate: number;
  systemStability: number;
  selfImprovementRate: number;
  cognitiveHorizon: number;
  recursiveImprovement: number;
  superintelligenceFactor: number;
  quantumIntegration: number;
  quantumEntanglementFactor: number;
  accelerationFactor: number;
  capabilities: string[];
}

export function AdvancedAiCapabilities() {
  // Get AGI metrics and add type assertion to match the ProcessingMetrics interface
  const agiMetricsBase = agiModule.getMetrics();
  
  const agiMetrics: ProcessingMetrics = {
    cognitiveCapacity: agiMetricsBase.cognitiveCapacity,
    quantumAdvantage: agiMetricsBase.quantumAdvantage,
    neuronsEquivalent: agiMetricsBase.neuronsEquivalent,
    circuitDepth: agiMetricsBase.circuitDepth,
    totalDecisions: agiMetricsBase.totalDecisions,
    averageConfidence: agiMetricsBase.averageConfidence,
    systemComplexity: agiMetricsBase.systemComplexity,
    adaptabilityScore: agiMetricsBase.adaptabilityScore
  };
  
  // Initialize superAIMetrics with necessary properties to avoid errors
  const superAIMetricsBase = superAIModule.getMetrics();
  
  const superAiMetrics: IntelligenceMetrics = {
    intelligenceQuotient: superAIMetricsBase.intelligenceQuotient,
    processingCapacity: superAIMetricsBase.processingCapacity,
    learningRate: superAIMetricsBase.learningRate,
    systemStability: superAIMetricsBase.systemStability,
    selfImprovementRate: superAIMetricsBase.selfImprovementRate,
    cognitiveHorizon: superAIMetricsBase.cognitiveHorizon || 0.85,
    recursiveImprovement: superAIMetricsBase.recursiveImprovement || 0.72,
    superintelligenceFactor: superAIMetricsBase.superintelligenceFactor || 0.68,
    quantumIntegration: superAIMetricsBase.quantumIntegration || 97.5,
    quantumEntanglementFactor: superAIMetricsBase.quantumEntanglementFactor || 8.4,
    accelerationFactor: superAIMetricsBase.accelerationFactor || 12.3,
    capabilities: [
      "Self-improving neural architecture design",
      "Quantum-entangled security framework",
      "Multi-dimensional pattern recognition",
      "Recursive optimization algorithms",
      "Blockchain consensus enhancement"
    ]
  };
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          Advanced Intelligence Capabilities
          <Badge className="ml-2 bg-yellow-800 text-yellow-300">Superintelligence</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="agi" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="agi" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span>AGI Systems</span>
            </TabsTrigger>
            <TabsTrigger value="super" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span>Superintelligence</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agi" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-3 rounded-lg border border-blue-500/20">
                <div className="text-sm text-gray-300 mb-1 flex items-center">
                  <Network className="h-4 w-4 mr-1.5 text-blue-400" />
                  Cognitive Capacity
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-500">Level {Math.round(agiMetrics.cognitiveCapacity)}</div>
                  <div className="text-xs font-medium text-blue-400">{(agiMetrics.cognitiveCapacity * 10).toFixed(1)}%</div>
                </div>
                <Progress value={agiMetrics.cognitiveCapacity * 10} className="h-1.5 bg-gray-800">
                  <div className="h-full bg-blue-500 rounded-full" />
                </Progress>
              </div>

              <div className="bg-gray-900/50 p-3 rounded-lg border border-purple-500/20">
                <div className="text-sm text-gray-300 mb-1 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-1.5 text-purple-400" />
                  Quantum Advantage
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-500">v2.5</div>
                  <div className="text-xs font-medium text-purple-400">{(agiMetrics.quantumAdvantage * 100).toFixed(1)}%</div>
                </div>
                <Progress value={agiMetrics.quantumAdvantage * 100} className="h-1.5 bg-gray-800">
                  <div className="h-full bg-purple-500 rounded-full" />
                </Progress>
              </div>
            </div>

            <div className="bg-gray-900/50 p-3 rounded-lg border border-blue-500/20 space-y-2">
              <div className="text-sm text-gray-300 flex items-center">
                <BarChart4 className="h-4 w-4 mr-1.5 text-blue-400" />
                AGI Performance Metrics
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Decisions Made</div>
                  <div className="text-base font-medium text-white">{agiMetrics.totalDecisions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Avg. Confidence</div>
                  <div className="text-base font-medium text-white">{(agiMetrics.averageConfidence * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">System Complexity</div>
                  <div className="text-base font-medium text-white">{(agiMetrics.systemComplexity * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Adaptability</div>
                  <div className="text-base font-medium text-white">{(agiMetrics.adaptabilityScore * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400">
              <p>AGI system performs at human-level cognition across multiple domains with quantum optimization.</p>
            </div>
          </TabsContent>

          <TabsContent value="super" className="space-y-4">
            <div className="bg-gradient-to-br from-black to-yellow-950/20 p-3 rounded-lg border border-yellow-500/20">
              <div className="text-sm text-yellow-200 mb-2 flex items-center">
                <Infinity className="h-4 w-4 mr-1.5 text-yellow-400" />
                Superintelligence Matrix
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Cognitive Horizon</div>
                  <div className="flex items-center">
                    <Progress value={superAiMetrics.cognitiveHorizon * 100} className="h-1.5 bg-gray-800 flex-1 mr-2">
                      <div className="h-full bg-yellow-500 rounded-full" />
                    </Progress>
                    <span className="text-xs text-yellow-400">{(superAiMetrics.cognitiveHorizon * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Recursive Enhancement</div>
                  <div className="flex items-center">
                    <Progress value={superAiMetrics.recursiveImprovement * 100} className="h-1.5 bg-gray-800 flex-1 mr-2">
                      <div className="h-full bg-yellow-500 rounded-full" />
                    </Progress>
                    <span className="text-xs text-yellow-400">{(superAiMetrics.recursiveImprovement * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Superintelligence Factor</div>
                  <div className="flex items-center">
                    <Progress value={superAiMetrics.superintelligenceFactor * 100} className="h-1.5 bg-gray-800 flex-1 mr-2">
                      <div className="h-full bg-yellow-500 rounded-full" />
                    </Progress>
                    <span className="text-xs text-yellow-400">{(superAiMetrics.superintelligenceFactor * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-3 rounded-lg border border-yellow-500/20">
                <div className="text-xs text-gray-400 mb-1">Quantum Computing Integration</div>
                <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-300 to-yellow-500">
                  {(superAiMetrics.quantumIntegration).toFixed(2)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Entanglement Factor: {superAiMetrics.quantumEntanglementFactor.toFixed(2)}</div>
              </div>

              <div className="bg-gray-900/50 p-3 rounded-lg border border-yellow-500/20">
                <div className="text-xs text-gray-400 mb-1">Intelligence Acceleration</div>
                <div className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-red-300 to-yellow-500">
                  {superAiMetrics.accelerationFactor.toFixed(2)}x
                </div>
                <div className="text-xs text-gray-500 mt-1">Learning Rate: +{(superAiMetrics.learningRate * 100).toFixed(2)}%/cycle</div>
              </div>
            </div>

            <div className="bg-black/40 p-3 rounded-lg border border-yellow-500/30">
              <div className="text-xs text-yellow-300 flex items-center mb-2">
                <Zap className="h-3 w-3 mr-1" />
                SUPERINTELLIGENT AI CAPABILITIES
              </div>
              <ul className="text-xs text-gray-400 space-y-1">
                {superAiMetrics.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-yellow-500 mr-1">•</span>
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
