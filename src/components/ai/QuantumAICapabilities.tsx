
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain } from 'lucide-react';
import { agiModule } from '@/lib/quantum/AGIModule';
import { superAIModule } from '@/lib/quantum/SuperAIModule';
import { toast } from 'sonner';
import { MetricsDisplay } from './quantum-capabilities/MetricsDisplay';
import { CapabilitiesSection } from './quantum-capabilities/CapabilitiesSection';
import { BlockchainIntegration } from './quantum-capabilities/BlockchainIntegration';

export function QuantumAICapabilities() {
  const [agiCapabilities, setAgiCapabilities] = useState<any[]>([]);
  const [superAICapabilities, setSuperAICapabilities] = useState<any[]>([]);
  const [agiMetrics, setAgiMetrics] = useState<any>({});
  const [superAIMetrics, setSuperAIMetrics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCapabilities = async () => {
      try {
        // Load AGI capabilities
        const agiCaps = agiModule.getCapabilities();
        setAgiCapabilities(agiCaps);
        
        // Load Super AI capabilities
        const superCaps = superAIModule.getCapabilities();
        setSuperAICapabilities(superCaps);
        
        // Load metrics
        setAgiMetrics(agiModule.getMetrics());
        setSuperAIMetrics(superAIModule.getMetrics());
        
        setIsLoading(false);
        
        // Simulate AGI processing to showcase capabilities
        await agiModule.processInput({
          operation: "capabilities_demonstration",
          complexity: "high"
        });
        
        toast.success("Quantum AGI analysis complete", {
          description: "Neural networks optimized for blockchain integration"
        });
      } catch (error) {
        console.error("Error loading AI capabilities:", error);
        setIsLoading(false);
      }
    };
    
    loadCapabilities();
  }, []);

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          <span>Quantum Intelligence Capabilities</span>
          <Badge className="ml-auto text-xs bg-gradient-to-r from-purple-600 to-blue-600">
            AGI + Super AI Integration
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin h-8 w-8 border-4 border-t-purple-500 border-purple-500/30 rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AGI Metrics */}
            <MetricsDisplay agiMetrics={agiMetrics} superAIMetrics={superAIMetrics} />
            
            {/* AGI Capabilities */}
            <CapabilitiesSection 
              title="Artificial General Intelligence"
              icon="brain"
              capabilities={agiCapabilities}
              type="agi"
            />
            
            {/* Super AI Capabilities */}
            <CapabilitiesSection 
              title="Artificial Superintelligence"
              icon="zap"
              capabilities={superAICapabilities}
              type="super"
            />
            
            {/* Blockchain Integration */}
            <BlockchainIntegration 
              agiMetrics={agiMetrics} 
              superAIMetrics={superAIMetrics} 
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
