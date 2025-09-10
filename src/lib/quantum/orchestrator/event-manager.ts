
/**
 * Event Manager for AGI Orchestrator
 * 
 * Manages event listeners and notifications for the orchestrator
 */
import { OrchestratorEvent, OrchestratorEventListener } from './types';

export class EventManager {
  private eventListeners: Map<string, OrchestratorEventListener[]> = new Map();
  
  /**
   * Register an event listener
   */
  addEventListener<T>(event: string, listener: OrchestratorEventListener<T>): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event)?.push(listener as OrchestratorEventListener);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(listener as OrchestratorEventListener);
        if (index !== -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }
  
  /**
   * Notify all listeners for an event
   */
  notifyListeners(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in listener for event ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Get registered event types
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.eventListeners.keys());
  }
}

// Create and export singleton instance
export const eventManager = new EventManager();
export default eventManager;
