
import { DataRegisteredEvent, AccessRequestedEvent } from '../types';
import { blockchainEventProcessor } from './blockchain-event-processor';

/**
 * Service responsible for polling blockchain events
 */
export class BlockchainPoller {
  private isPolling: boolean = false;
  private quantumSeedEnabled: boolean = true;
  private pollingTimeout: NodeJS.Timeout | null = null;
  
  /**
   * Start polling for blockchain events
   */
  public startPolling(quantumSeedEnabled: boolean): void {
    this.isPolling = true;
    this.quantumSeedEnabled = quantumSeedEnabled;
    this.pollBlockchainEvents();
  }
  
  /**
   * Stop polling for blockchain events
   */
  public stopPolling(): void {
    this.isPolling = false;
    if (this.pollingTimeout) {
      clearTimeout(this.pollingTimeout);
      this.pollingTimeout = null;
    }
  }
  
  /**
   * Update quantum seed configuration
   */
  public updateQuantumSeedSetting(enabled: boolean): void {
    this.quantumSeedEnabled = enabled;
  }
  
  /**
   * Simulate polling for blockchain events
   */
  private pollBlockchainEvents(): void {
    if (!this.isPolling) return;
    
    // Simulate checking for events every 10 seconds
    this.pollingTimeout = setTimeout(async () => {
      if (!this.isPolling) return;
      
      // Simulate random blockchain events
      if (Math.random() > 0.6) {
        const eventType = Math.random() > 0.5 ? 'DataRegistered' : 'AccessRequested';
        
        if (eventType === 'DataRegistered') {
          const event: DataRegisteredEvent = {
            dataId: `data_${Date.now()}`,
            owner: `0x${Math.random().toString(16).substring(2, 10)}`,
            ipfsHash: `Qm${Math.random().toString(16).substring(2, 30)}`,
            timestamp: Date.now()
          };
          
          await blockchainEventProcessor.processDataRegistered(event, this.quantumSeedEnabled);
        } else {
          const event: AccessRequestedEvent = {
            dataId: `data_${Math.floor(Date.now() / 1000)}`,
            requestId: `req_${Date.now()}`,
            requester: `0x${Math.random().toString(16).substring(2, 10)}`,
            purpose: "Medical research on gene expression patterns in cancer cells",
            timestamp: Date.now()
          };
          
          await blockchainEventProcessor.processAccessRequested(event, this.quantumSeedEnabled);
        }
      }
      
      // Continue polling
      this.pollBlockchainEvents();
    }, 10000);
  }
}

export const blockchainPoller = new BlockchainPoller();
export default blockchainPoller;
