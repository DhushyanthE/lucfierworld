
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';
import { toast } from 'sonner';
import { superAIModule } from '@/lib/quantum/SuperAIModule';
import { dataScienceAGI } from '@/lib/quantum/DataScienceAGI';

// Import our new components
import { CloudResourcesMetrics } from './data-science/CloudResourcesMetrics';
import { IoTNetworkMetrics } from './data-science/IoTNetworkMetrics';
import { QuantumAIStats } from './data-science/QuantumAIStats';

export function DataScienceAICapabilities() {
  const [isLoading, setIsLoading] = useState(false);
  const [cloudResources, setCloudResources] = useState({
    cpuUtilization: 0.85,
    memoryUsage: 0.77,
    networkEfficiency: 0.70,
    storageOptimization: 0.62
  });
  
  const [iotNetwork, setIotNetwork] = useState({
    deviceEfficiency: 0.73,
    powerConsumption: 0.85,
    dataTransmissionRate: 0.65,
    networkLatency: 0.76
  });
  
  const [optimizationCount, setOptimizationCount] = useState(0);
  
  useEffect(() => {
    // Initial data processing demonstration
    const processInitialData = async () => {
      try {
        const sampleData = Array(100).fill(0).map((_, i) => ({
          timestamp: Date.now() - (i * 1000 * 60),
          value: Math.random() * 100,
          category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
        }));
        
        await dataScienceAGI.analyzeDataset(sampleData);
      } catch (error) {
        console.error("Error analyzing initial dataset:", error);
      }
    };
    
    processInitialData();
  }, []);
  
  const optimizeCloudResources = async () => {
    setIsLoading(true);
    try {
      const result = await dataScienceAGI.optimizeCloudResources(cloudResources);
      setCloudResources(prev => ({
        ...prev,
        cpuUtilization: result.cpuUtilization,
        memoryUsage: result.memoryUsage,
        networkEfficiency: result.networkEfficiency
      }));
      
      setOptimizationCount(prev => prev + 1);
      
      toast.success("Cloud resources optimized", {
        description: `Cost reduction: ${(result.costReduction * 100).toFixed(1)}%`
      });
    } catch (error) {
      console.error("Error optimizing cloud resources:", error);
      toast.error("Optimization failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  const optimizeIoTNetwork = async () => {
    setIsLoading(true);
    try {
      // Use superAIModule to optimize IoT network
      const result = await superAIModule.optimizeIoTNetwork(iotNetwork);
      
      setIotNetwork({
        deviceEfficiency: result.deviceEfficiency,
        powerConsumption: result.powerConsumption,
        dataTransmissionRate: result.dataTransmissionRate,
        networkLatency: result.networkLatency
      });
      
      setOptimizationCount(prev => prev + 1);
      
      toast.success("IoT network optimized", {
        description: `Optimization score: ${(result.optimizationScore * 100).toFixed(1)}%`
      });
    } catch (error) {
      console.error("Error optimizing IoT network:", error);
      toast.error("IoT optimization failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Database className="h-5 w-5 text-blue-400 mr-2" />
            <span>Quantum Data Science Integration</span>
          </div>
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
            AI-Enhanced
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Data Science Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cloud Resources Component */}
            <CloudResourcesMetrics 
              cloudResources={cloudResources} 
              isLoading={isLoading} 
              optimizeCloudResources={optimizeCloudResources} 
            />
            
            {/* IoT Network Component */}
            <IoTNetworkMetrics 
              iotNetwork={iotNetwork} 
              isLoading={isLoading} 
              optimizeIoTNetwork={optimizeIoTNetwork} 
            />
          </div>
          
          {/* AI Integration Stats Component */}
          <QuantumAIStats optimizationCount={optimizationCount} />
        </div>
      </CardContent>
    </Card>
  );
}
