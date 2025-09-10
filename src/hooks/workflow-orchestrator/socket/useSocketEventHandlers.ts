
/**
 * Socket Event Handlers Hook
 */

import { useEffect } from 'react';
import io from 'socket.io-client';

type Socket = ReturnType<typeof io>;

interface UseSocketEventHandlersOptions {
  socket: Socket | null;
  options: {
    onWorkflowComplete?: (workflowId: string, results: Record<string, any>) => void;
    onStepComplete?: (workflowId: string, stepId: string, result: any) => void;
    onError?: (error: string) => void;
  };
  refreshWorkflows: () => void;
}

export function useSocketEventHandlers({
  socket,
  options,
  refreshWorkflows
}: UseSocketEventHandlersOptions) {
  useEffect(() => {
    if (!socket) return;

    const handleWorkflowComplete = (data: { workflowId: string; results: Record<string, any> }) => {
      console.log('Workflow completed:', data);
      if (options.onWorkflowComplete) {
        options.onWorkflowComplete(data.workflowId, data.results);
      }
      refreshWorkflows();
    };

    const handleStepComplete = (data: { workflowId: string; stepId: string; result: any }) => {
      console.log('Step completed:', data);
      if (options.onStepComplete) {
        options.onStepComplete(data.workflowId, data.stepId, data.result);
      }
      refreshWorkflows();
    };

    const handleError = (error: string) => {
      console.error('Socket error:', error);
      if (options.onError) {
        options.onError(error);
      }
    };

    socket.on('workflowCompleted', handleWorkflowComplete);
    socket.on('stepComplete', handleStepComplete);
    socket.on('error', handleError);

    return () => {
      socket.off('workflowCompleted', handleWorkflowComplete);
      socket.off('stepComplete', handleStepComplete);
      socket.off('error', handleError);
    };
  }, [socket, options, refreshWorkflows]);
}
