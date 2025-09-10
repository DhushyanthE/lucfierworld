
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Zap } from 'lucide-react';
import { useQuantumAIMetrics } from './metrics/useQuantumAIMetrics';
import { AGIMetricsTab } from './metrics/AGIMetricsTab';
import { SuperAIMetricsTab } from './metrics/SuperAIMetricsTab';

export function QuantumSuperAIMetrics() {
  const { 
    activeTab,
    setActiveTab,
    agiMetrics,
    superAIMetrics,
    agiCapabilities,
    superAICapabilities,
    isLoading,
    lastUpdated,
    performSuperAIBlockchainOptimization
  } = useQuantumAIMetrics();

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-black/0 pointer-events-none"></div>
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="h-5 w-5 text-indigo-400" />
          <span>Advanced AI Cognitive Systems</span>
          {lastUpdated && (
            <span className="text-xs bg-indigo-900/30 text-white rounded-full px-2 py-0.5 ml-auto">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="agi" className="data-[state=active]:bg-indigo-900/30 text-white">
              <Brain className="h-4 w-4 mr-2" />
              Artificial General Intelligence
            </TabsTrigger>
            <TabsTrigger value="super" className="data-[state=active]:bg-indigo-900/30 text-white">
              <Zap className="h-4 w-4 mr-2" />
              Artificial Super Intelligence
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="agi" className="focus-visible:outline-none focus-visible:ring-0">
            <AGIMetricsTab 
              isLoading={isLoading}
              metrics={agiMetrics}
              capabilities={agiCapabilities}
            />
          </TabsContent>
          
          <TabsContent value="super" className="focus-visible:outline-none focus-visible:ring-0">
            <SuperAIMetricsTab 
              isLoading={isLoading}
              metrics={superAIMetrics}
              capabilities={superAICapabilities}
              onOptimize={performSuperAIBlockchainOptimization}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
