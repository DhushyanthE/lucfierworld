import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OrchestratorCommand {
  command: 'deploy_model' | 'train_distributed' | 'run_inference' | 'verify_consensus' | 'optimize_workflow';
  workflow?: any;
  realtime?: boolean;
}

export function useBlockchainANNOrchestrator() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const executeCommand = useCallback(async (commandData: OrchestratorCommand) => {
    setIsProcessing(true);
    try {
      console.log('Executing orchestrator command:', commandData.command);
      
      const { data, error } = await supabase.functions.invoke('blockchain-ann-orchestrator', {
        body: commandData
      });

      if (error) throw error;

      setResult(data.result);
      toast.success(`Command ${commandData.command} executed successfully`);
      return data.result;
    } catch (error) {
      console.error('Orchestrator error:', error);
      toast.error('Failed to execute command');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const deployModel = useCallback((workflow: any) => {
    return executeCommand({ command: 'deploy_model', workflow });
  }, [executeCommand]);

  const trainDistributed = useCallback((workflow: any) => {
    return executeCommand({ command: 'train_distributed', workflow });
  }, [executeCommand]);

  const runInference = useCallback((workflow: any) => {
    return executeCommand({ command: 'run_inference', workflow });
  }, [executeCommand]);

  const verifyConsensus = useCallback((workflow: any) => {
    return executeCommand({ command: 'verify_consensus', workflow });
  }, [executeCommand]);

  const optimizeWorkflow = useCallback((workflow: any) => {
    return executeCommand({ command: 'optimize_workflow', workflow });
  }, [executeCommand]);

  return {
    isProcessing,
    result,
    executeCommand,
    deployModel,
    trainDistributed,
    runInference,
    verifyConsensus,
    optimizeWorkflow
  };
}
