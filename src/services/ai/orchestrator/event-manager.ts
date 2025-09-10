
type EventCallback = (data: any) => void;

/**
 * Event manager for orchestrator events
 */
export class EventManager {
  private static instance: EventManager;
  private events: Map<string, EventCallback[]> = new Map();
  
  private constructor() {}
  
  static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }
  
  /**
   * Subscribe to an event
   */
  subscribe(eventName: string, callback: EventCallback): void {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    
    const callbacks = this.events.get(eventName);
    if (callbacks) {
      callbacks.push(callback);
    }
  }
  
  /**
   * Unsubscribe from an event
   */
  unsubscribe(eventName: string, callback: EventCallback): void {
    const callbacks = this.events.get(eventName);
    if (!callbacks) return;
    
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }
  
  /**
   * Emit an event
   */
  emit(eventName: string, data: any): void {
    const callbacks = this.events.get(eventName);
    if (!callbacks) return;
    
    for (const callback of callbacks) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event callback for ${eventName}:`, error);
      }
    }
  }
  
  /**
   * Clear all events
   */
  clear(): void {
    this.events.clear();
  }
}

export const eventManager = EventManager.getInstance();
export default eventManager;
