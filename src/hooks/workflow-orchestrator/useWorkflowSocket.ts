
/**
 * Workflow Socket Management Hook
 */

import { useSocketConnection } from './socket/useSocketConnection';
import { useSocketEventHandlers } from './socket/useSocketEventHandlers';

interface UseWorkflowSocketOptions {
  enableRealTimeUpdates?: boolean;
  onWorkflowComplete?: (workflowId: string, results: Record<string, any>) => void;
  onStepComplete?: (workflowId: string, stepId: string, result: any) => void;
  onError?: (error: string) => void;
}

export function useWorkflowSocket(
  options: UseWorkflowSocketOptions,
  refreshWorkflows: () => void
) {
  // Connect to the WebSocket server for real-time updates
  const socket = useSocketConnection(
    options.enableRealTimeUpdates || false,
    options.onError
  );

  // Handle socket events
  useSocketEventHandlers({
    socket,
    options,
    refreshWorkflows
  });

  return socket;
}
