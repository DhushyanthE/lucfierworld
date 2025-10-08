import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type OptimizationGoal = 'speed' | 'accuracy' | 'cost' | 'energy';

export function useWorkflowOptimizer() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedWorkflow, setOptimizedWorkflow] = useState<any[]>([]);
  const [improvements, setImprovements] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const optimizeWorkflow = useCallback(async (
    workflow: any,
    optimizationGoals: OptimizationGoal[] = ['speed', 'accuracy', 'cost']
  ) => {
    setIsOptimizing(true);
    try {
      console.log('Optimizing workflow with goals:', optimizationGoals);
      
      const { data, error } = await supabase.functions.invoke('workflow-optimizer', {
        body: { workflow, optimizationGoals }
      });

      if (error) throw error;

      setOptimizedWorkflow(data.optimizedWorkflow || []);
      setImprovements(data.improvements || {});
      setRecommendations(data.recommendations || []);
      
      const speedGain = ((data.improvements?.speedGain || 0) * 100).toFixed(1);
      toast.success(`Workflow optimized: ${speedGain}% faster`);
      return data;
    } catch (error) {
      console.error('Workflow optimization error:', error);
      toast.error('Failed to optimize workflow');
      throw error;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  return {
    isOptimizing,
    optimizedWorkflow,
    improvements,
    recommendations,
    optimizeWorkflow
  };
}
