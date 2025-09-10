/**
 * Project Mariner Real-Time Service
 * 
 * Handles real-time workflow execution, data streaming, and ocean exploration monitoring
 */
import { EventEmitter } from 'events';
import { toast } from 'sonner';
import { MarinerDataGenerator, MarinerDataPoint } from './mariner/MarinerDataGenerator';
import { MarinerWorkflowManager, MarinerWorkflowProgress } from './mariner/MarinerWorkflowManager';
import { MarinerConnectionManager } from './mariner/MarinerConnectionManager';

export type { MarinerDataPoint, MarinerWorkflowProgress };

class ProjectMarinerRealtimeService extends EventEmitter {
  private dataStream: MarinerDataPoint[] = [];
  private dataGenerator: MarinerDataGenerator;
  private workflowManager: MarinerWorkflowManager;
  private connectionManager: MarinerConnectionManager;
  private dataStreamInterval: NodeJS.Timeout | null = null;
  private workflowUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.dataGenerator = new MarinerDataGenerator();
    this.workflowManager = new MarinerWorkflowManager();
    this.connectionManager = new MarinerConnectionManager();
    
    // Setup event forwarding from sub-managers to main service
    this.setupEventForwarding();
    this.setupRealtimeConnection();
  }

  /**
   * Setup event forwarding from sub-managers to main service
   */
  private setupEventForwarding(): void {
    // Forward connection events
    this.connectionManager.on('connected', () => this.emit('connected'));
    this.connectionManager.on('disconnected', () => this.emit('disconnected'));
    this.connectionManager.on('connectionFailed', () => this.emit('connectionFailed'));
    
    // Forward workflow events
    this.workflowManager.on('workflowStarted', (workflow) => this.emit('workflowStarted', workflow));
    this.workflowManager.on('workflowProgress', (workflow) => this.emit('workflowProgress', workflow));
    this.workflowManager.on('workflowCompleted', (workflow) => {
      this.emit('workflowCompleted', workflow);
      toast.success('Project Mariner workflow completed!');
    });
  }

  /**
   * Initialize real-time connection for Project Mariner
   */
  private setupRealtimeConnection(): void {
    this.connectionManager.setupRealtimeConnection();
    this.startDataStreaming();
  }

  /**
   * Start real-time data streaming
   */
  private startDataStreaming(): void {
    this.emit('streamingStarted');
    console.log('Project Mariner data streaming started');
    
    // Simulate periodic data updates from ocean exploration
    this.dataStreamInterval = setInterval(() => {
      if (this.connectionManager.isConnectedToMariner()) {
        const dataPoint = this.dataGenerator.generateOceanDataPoint();
        this.dataStream.push(dataPoint);
        this.emit('dataReceived', dataPoint);
        
        // Keep only last 1000 data points
        if (this.dataStream.length > 1000) {
          this.dataStream = this.dataStream.slice(-1000);
        }
      }
    }, 2000); // Update every 2 seconds

    // Simulate workflow progress updates
    this.workflowUpdateInterval = setInterval(() => {
      this.workflowManager.getActiveWorkflows().forEach(workflow => {
        if (workflow.status === 'running') {
          this.workflowManager.updateWorkflowProgress(workflow.workflowId);
        }
      });
    }, 5000); // Update workflow progress every 5 seconds
  }

  /**
   * Start a Project Mariner workflow
   */
  public startMarinerWorkflow(workflowId: string, workflowName: string): void {
    this.workflowManager.startMarinerWorkflow(workflowId, workflowName);
  }

  /**
   * Get latest ocean data
   */
  public getLatestData(count: number = 10): MarinerDataPoint[] {
    return this.dataStream.slice(-count);
  }

  /**
   * Get active workflow status
   */
  public getWorkflowStatus(workflowId: string): MarinerWorkflowProgress | undefined {
    return this.workflowManager.getWorkflowStatus(workflowId);
  }

  /**
   * Get all active workflows
   */
  public getActiveWorkflows(): MarinerWorkflowProgress[] {
    return this.workflowManager.getActiveWorkflows();
  }

  /**
   * Check connection status
   */
  public isConnectedToMariner(): boolean {
    return this.connectionManager.isConnectedToMariner();
  }

  /**
   * Manually disconnect
   */
  public disconnect(): void {
    this.connectionManager.disconnect();
    
    if (this.dataStreamInterval) {
      clearInterval(this.dataStreamInterval);
      this.dataStreamInterval = null;
    }
    
    if (this.workflowUpdateInterval) {
      clearInterval(this.workflowUpdateInterval);
      this.workflowUpdateInterval = null;
    }
  }

  /**
   * Force reconnection
   */
  public reconnect(): void {
    this.disconnect();
    this.connectionManager.reconnect();
    this.startDataStreaming();
  }
}

// Export singleton instance
export const projectMarinerRealtimeService = new ProjectMarinerRealtimeService();
export default projectMarinerRealtimeService;
