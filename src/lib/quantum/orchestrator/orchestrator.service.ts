
/**
 * AGI Orchestrator Service
 * 
 * Connects blockchain events with AI reasoning capabilities for genomic data processing.
 * This service listens to blockchain events, processes data using AI models,
 * and can emit events back to the blockchain.
 */

import { toast } from 'sonner';
import { 
  DataRegisteredEvent, 
  AccessRequestedEvent, 
  OrchestratorStatus
} from './types';
import { eventManager } from './event-manager';
import { blockchainPoller } from './services/blockchain-poller';
import { blockchainEventProcessor } from './services/blockchain-event-processor';

class AGIOrchestratorService {
  private isRunning: boolean = false;
  private quantumSeedEnabled: boolean = true;
  
  /**
   * Start the AGI orchestrator service
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("AGI Orchestrator service started");
    
    // Initialize periodic blockchain event checking
    blockchainPoller.startPolling(this.quantumSeedEnabled);
    
    toast.success("AGI Orchestrator service started", {
      description: "Listening for genomic data events on blockchain"
    });
  }
  
  /**
   * Stop the AGI orchestrator service
   */
  public stop(): void {
    this.isRunning = false;
    blockchainPoller.stopPolling();
    console.log("AGI Orchestrator service stopped");
    
    toast.info("AGI Orchestrator service stopped");
  }
  
  /**
   * Toggle quantum seed for AGI prompts
   */
  public toggleQuantumSeed(enabled: boolean): void {
    this.quantumSeedEnabled = enabled;
    blockchainPoller.updateQuantumSeedSetting(enabled);
    console.log(`Quantum seed for AGI prompts ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Process a DataRegistered event
   */
  public async processDataRegistered(event: DataRegisteredEvent): Promise<void> {
    await blockchainEventProcessor.processDataRegistered(event, this.quantumSeedEnabled);
  }
  
  /**
   * Process an AccessRequested event
   */
  public async processAccessRequested(event: AccessRequestedEvent): Promise<void> {
    await blockchainEventProcessor.processAccessRequested(event, this.quantumSeedEnabled);
  }
  
  /**
   * Register an event listener
   */
  public addEventListener<T>(event: string, listener: (data: T) => void): () => void {
    return eventManager.addEventListener(event, listener);
  }
  
  /**
   * Get the current status of the orchestrator
   */
  public getStatus(): OrchestratorStatus {
    return {
      isRunning: this.isRunning,
      quantumSeedEnabled: this.quantumSeedEnabled,
      registeredEventTypes: eventManager.getRegisteredEventTypes()
    };
  }
}

// Create and export singleton instance
export const agiOrchestratorService = new AGIOrchestratorService();
export default agiOrchestratorService;
