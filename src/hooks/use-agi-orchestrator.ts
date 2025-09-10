import { useState, useEffect } from 'react';
import { agiOrchestratorService } from '@/lib/quantum/orchestrator';

export type OrchestrationEvent = {
  id: string;
  type: string;
  timestamp: number;
  data: any;
};

export function useAGIOrchestrator() {
  const [isRunning, setIsRunning] = useState(false);
  const [quantumSeedEnabled, setQuantumSeedEnabled] = useState(true);
  const [events, setEvents] = useState<OrchestrationEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  
  // Initialize state on mount
  useEffect(() => {
    const status = agiOrchestratorService.getStatus();
    setIsRunning(status.isRunning);
    setQuantumSeedEnabled(status.quantumSeedEnabled);
    
    // Register event listeners
    const unsubscribeDataRegistered = agiOrchestratorService.addEventListener('dataRegistered', 
      (data: any) => {
        setIsProcessing(true);
        setCurrentTask(`Processing genomic data ${data.dataId}`);
        addEvent('DataRegistered', data);
      }
    );
    
    const unsubscribeAccessRequested = agiOrchestratorService.addEventListener('accessRequested',
      (data: any) => {
        setIsProcessing(true);
        setCurrentTask(`Assessing access request ${data.requestId}`);
        addEvent('AccessRequested', data);
      }
    );
    
    const unsubscribeDataSummarized = agiOrchestratorService.addEventListener('dataSummarized',
      (data: any) => {
        setIsProcessing(false);
        setCurrentTask(null);
        addEvent('DataSummarized', data);
      }
    );
    
    const unsubscribeAccessApproved = agiOrchestratorService.addEventListener('accessApproved',
      (data: any) => {
        setIsProcessing(false);
        setCurrentTask(null);
        addEvent('AccessApproved', data);
      }
    );
    
    const unsubscribeAccessDenied = agiOrchestratorService.addEventListener('accessDenied',
      (data: any) => {
        setIsProcessing(false);
        setCurrentTask(null);
        addEvent('AccessDenied', data);
      }
    );
    
    // Cleanup listeners on unmount
    return () => {
      unsubscribeDataRegistered();
      unsubscribeDataSummarized();
      unsubscribeAccessRequested();
      unsubscribeAccessApproved();
      unsubscribeAccessDenied();
    };
  }, []);
  
  // Add new event to state
  const addEvent = (type: string, data: any) => {
    setEvents(prev => [{
      id: `${type.toLowerCase()}_${Date.now()}`,
      type,
      timestamp: Date.now(),
      data
    }, ...prev].slice(0, 50)); // Keep only the last 50 events
  };
  
  // Start the orchestrator service
  const startOrchestrator = () => {
    agiOrchestratorService.start();
    setIsRunning(true);
  };
  
  // Stop the orchestrator service
  const stopOrchestrator = () => {
    agiOrchestratorService.stop();
    setIsRunning(false);
  };
  
  // Toggle the orchestrator service
  const toggleOrchestrator = () => {
    if (isRunning) {
      stopOrchestrator();
    } else {
      startOrchestrator();
    }
  };
  
  // Toggle quantum seed
  const toggleQuantumSeed = (enabled: boolean) => {
    agiOrchestratorService.toggleQuantumSeed(enabled);
    setQuantumSeedEnabled(enabled);
  };
  
  // Simulate a new data registration event
  const simulateDataRegistration = async () => {
    const mockEvent = {
      dataId: `data_${Date.now()}`,
      owner: `0x${Math.random().toString(16).substring(2, 10)}`,
      ipfsHash: `Qm${Math.random().toString(16).substring(2, 30)}`,
      timestamp: Date.now()
    };
    
    await agiOrchestratorService.processDataRegistered(mockEvent);
  };
  
  // Simulate a new access request event
  const simulateAccessRequest = async () => {
    const mockEvent = {
      dataId: `data_${Math.floor(Date.now() / 1000)}`,
      requestId: `req_${Date.now()}`,
      requester: `0x${Math.random().toString(16).substring(2, 10)}`,
      purpose: "Research on genetic markers for rare diseases",
      timestamp: Date.now()
    };
    
    await agiOrchestratorService.processAccessRequested(mockEvent);
  };
  
  // Clear all events
  const clearEvents = () => {
    setEvents([]);
  };
  
  return {
    isRunning,
    quantumSeedEnabled,
    events,
    isProcessing,
    currentTask,
    startOrchestrator,
    stopOrchestrator,
    toggleOrchestrator,
    toggleQuantumSeed,
    simulateDataRegistration,
    simulateAccessRequest,
    clearEvents,
  };
}

export default useAGIOrchestrator;
