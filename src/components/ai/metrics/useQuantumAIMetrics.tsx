
import { useState, useEffect } from 'react';
import { agiModule } from '@/lib/quantum/AGIModule';
import { superAIModule } from '@/lib/quantum/SuperAIModule';
import { toast } from 'sonner';

export function useQuantumAIMetrics() {
  const [activeTab, setActiveTab] = useState('agi');
  const [agiMetrics, setAgiMetrics] = useState<any>(null);
  const [superAIMetrics, setSuperAIMetrics] = useState<any>(null);
  const [agiCapabilities, setAgiCapabilities] = useState<any[]>([]);
  const [superAICapabilities, setSuperAICapabilities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  useEffect(() => {
    // Load metrics on component mount
    loadMetrics();
    
    // Set up refresh interval
    const intervalId = setInterval(loadMetrics, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      // Load AGI metrics
      const agiMet = agiModule.getMetrics();
      const agiCap = agiModule.getCapabilities();
      
      // Load Super AI metrics
      const superMet = superAIModule.getMetrics();
      const superCap = superAIModule.getCapabilities();
      
      // Update state
      setAgiMetrics(agiMet);
      setSuperAIMetrics({
        // Fill in missing properties that are used in the component
        intelligenceQuotient: 180,
        processingCapacity: 15000,
        quantumCoherenceLevel: 0.92,
        selfImprovementRate: 1.67,
        systemStability: 0.95,
        ...superMet
      });
      setAgiCapabilities(agiCap);
      setSuperAICapabilities(superCap);
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading AI metrics:", error);
      toast.error("Failed to load AI metrics");
      setIsLoading(false);
    }
  };
  
  const performSuperAIBlockchainOptimization = async () => {
    setIsLoading(true);
    try {
      // Perform blockchain optimization using the correct method
      const result = await superAIModule.optimizeBlockchainNetwork({
        nodes: 250,
        connections: 1200,
        transactionVolume: 2500,
        blockSize: 2,
        consensusMechanism: "Proof of Stake"
      });
      
      // Update Super AI metrics based on performance
      superAIModule.updateMetrics();
      
      // Refresh metrics
      loadMetrics();
      
      // Show success toast
      toast.success("Blockchain network optimized", {
        description: `Improved efficiency by ${(result.improvementRatio * 100).toFixed(1)}% using ${result.optimizationApproach}`
      });
    } catch (error) {
      console.error("Error performing optimization:", error);
      toast.error("Optimization failed");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    agiMetrics,
    superAIMetrics,
    agiCapabilities,
    superAICapabilities,
    isLoading,
    lastUpdated,
    performSuperAIBlockchainOptimization
  };
}
