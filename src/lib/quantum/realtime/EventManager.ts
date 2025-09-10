
/**
 * Manages events and subscriptions for the Real-Time Quantum Processor
 */
import { QuantumProcessorEvent, QuantumProcessorEventType, ProcessorEventCallback } from './types';

export class EventManager {
  private events: QuantumProcessorEvent[] = [];
  private eventListeners: Record<string, Array<ProcessorEventCallback>> = {};

  // Add a new event to the history
  public addEvent(event: QuantumProcessorEvent): void {
    this.events.push(event);
    this.notifyListeners(event.type, event);
  }

  // Subscribe to processor events
  public addEventListener(
    eventType: QuantumProcessorEventType,
    callback: ProcessorEventCallback
  ): () => void {
    if (!this.eventListeners[eventType]) {
      this.eventListeners[eventType] = [];
    }
    
    this.eventListeners[eventType].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.eventListeners[eventType] = this.eventListeners[eventType].filter(
        listener => listener !== callback
      );
    };
  }

  // Notify event listeners
  public notifyListeners(
    eventType: QuantumProcessorEventType,
    event: QuantumProcessorEvent
  ): void {
    if (!this.eventListeners[eventType]) return;
    
    this.eventListeners[eventType].forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in event listener callback:', error);
      }
    });
  }

  // Get latest events
  public getEvents(limit: number = 10): QuantumProcessorEvent[] {
    return this.events.slice(-limit);
  }
}
