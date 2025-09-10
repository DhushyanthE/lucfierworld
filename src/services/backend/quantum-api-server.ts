/**
 * Quantum API Server
 * 
 * Express.js server with comprehensive endpoints for quantum AI operations,
 * WebSocket real-time communication, and advanced middleware.
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
// Rate limiting functionality will be implemented with a simple middleware
import { tensorFlowService } from '../ai/tensorflow-service';
import { QuantumContractService } from '../web3/quantum-contract-service';
import { n8nAgenticService } from '../ai/n8n-agentic-service';
import { quantumValleyBackendService } from './QuantumValleyBackendService';

export interface ApiServerConfig {
  port: number;
  corsOrigin: string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  contractConfig: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  executionTime: number;
  quantumSignature?: string;
}

export class QuantumApiServer {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private contractService: QuantumContractService;
  private config: ApiServerConfig;

  constructor(config: ApiServerConfig) {
    this.config = config;
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST']
      }
    });

    this.contractService = new QuantumContractService(config.contractConfig);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: this.config.corsOrigin,
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Simple rate limiting middleware
    const requestCounts = new Map();
    this.app.use('/api/', (req, res, next) => {
      const ip = req.ip;
      const now = Date.now();
      const windowStart = now - this.config.rateLimit.windowMs;
      
      if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
      }
      
      const requests = requestCounts.get(ip).filter((time: number) => time > windowStart);
      
      if (requests.length >= this.config.rateLimit.maxRequests) {
        return res.status(429).json({
          error: 'Too many requests from this IP, please try again later.',
          timestamp: new Date().toISOString()
        });
      }
      
      requests.push(now);
      requestCounts.set(ip, requests);
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Response time tracking
    this.app.use((req, res, next) => {
      req.startTime = Date.now();
      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/api/health', (req, res) => {
      this.sendResponse(res, req, {
        status: 'healthy',
        services: {
          tensorflow: !!tensorFlowService,
          contract: !!this.contractService,
          n8n: !!n8nAgenticService,
          backend: !!quantumValleyBackendService
        }
      });
    });

    // TensorFlow AI endpoints
    this.setupTensorFlowRoutes();

    // Quantum contract endpoints
    this.setupContractRoutes();

    // N8N Agentic AI endpoints
    this.setupAgenticRoutes();

    // Backend service endpoints
    this.setupBackendRoutes();

    // Real-time metrics endpoint
    this.app.get('/api/metrics/realtime', async (req, res) => {
      try {
        const [tensorflowMetrics, contractMetrics, agenticMetrics, backendMetrics] = await Promise.all([
          tensorFlowService.getModelSummary(),
          this.contractService.getQuantumMetrics(),
          n8nAgenticService.getLearningMetrics(),
          quantumValleyBackendService.getMetrics()
        ]);

        this.sendResponse(res, req, {
          tensorflow: tensorflowMetrics,
          contract: contractMetrics,
          agentic: agenticMetrics,
          backend: backendMetrics
        });
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Error handling
    this.app.use((err: any, req: any, res: any, next: any) => {
      console.error('API Error:', err);
      this.sendError(res, req, err);
    });
  }

  /**
   * Setup TensorFlow AI routes
   */
  private setupTensorFlowRoutes(): void {
    // Initialize model
    this.app.post('/api/ai/initialize', async (req, res) => {
      try {
        await tensorFlowService.initializeModel();
        this.sendResponse(res, req, { message: 'TensorFlow model initialized' });
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Train model
    this.app.post('/api/ai/train', async (req, res) => {
      try {
        const { config, useGenerated = true } = req.body;
        
        let trainingData, labels;
        if (useGenerated) {
          const synthetic = tensorFlowService.generateSyntheticData(1024);
          trainingData = synthetic.data;
          labels = synthetic.labels;
        } else {
          trainingData = req.body.trainingData;
          labels = req.body.labels;
        }

        const history = await tensorFlowService.trainModel(trainingData, labels, config);
        
        // Emit real-time training updates
        this.io.emit('training-update', {
          type: 'completed',
          history: history.slice(-5), // Last 5 epochs
          timestamp: Date.now()
        });

        this.sendResponse(res, req, { history, totalEpochs: history.length });
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Predict patterns
    this.app.post('/api/ai/predict', async (req, res) => {
      try {
        const { inputData } = req.body;
        const prediction = await tensorFlowService.predict(inputData);
        
        // Emit real-time prediction
        this.io.emit('prediction-update', {
          type: 'new-prediction',
          prediction,
          timestamp: Date.now()
        });

        this.sendResponse(res, req, prediction);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Get model summary
    this.app.get('/api/ai/model-summary', (req, res) => {
      try {
        const summary = tensorFlowService.getModelSummary();
        this.sendResponse(res, req, summary);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });
  }

  /**
   * Setup quantum contract routes
   */
  private setupContractRoutes(): void {
    // Initialize contract
    this.app.post('/api/contract/initialize', async (req, res) => {
      try {
        await this.contractService.initialize();
        this.sendResponse(res, req, { message: 'Contract initialized' });
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Execute analysis algorithms
    this.app.post('/api/contract/analyze/:method', async (req, res) => {
      try {
        const { method } = req.params;
        const { txId, threshold, keyHash } = req.body;

        let result;
        switch (method) {
          case 'greedy':
            result = await this.contractService.executeGreedyAnalysis(txId, threshold);
            break;
          case 'dp':
            result = await this.contractService.executeDPAnalysis(txId, keyHash);
            break;
          case 'divide':
            result = await this.contractService.executeDivideConquerAnalysis(txId);
            break;
          case 'genetic':
            result = await this.contractService.executeGeneticOptimization(txId);
            break;
          case 'grover':
            result = await this.contractService.executeGroverSearch(txId);
            break;
          default:
            throw new Error(`Unknown analysis method: ${method}`);
        }

        // Emit real-time analysis update
        this.io.emit('analysis-update', {
          type: 'analysis-completed',
          method,
          result,
          timestamp: Date.now()
        });

        this.sendResponse(res, req, result);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Quantum Coin operations
    this.app.get('/api/contract/balance/:address', async (req, res) => {
      try {
        const balance = await this.contractService.getQuantumCoinBalance(req.params.address);
        this.sendResponse(res, req, balance);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    this.app.post('/api/contract/stake', async (req, res) => {
      try {
        const { amount } = req.body;
        const result = await this.contractService.stakeQuantumCoin(amount);
        
        this.io.emit('staking-update', {
          type: 'stake-completed',
          result,
          timestamp: Date.now()
        });

        this.sendResponse(res, req, result);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    this.app.post('/api/contract/claim-rewards', async (req, res) => {
      try {
        const result = await this.contractService.claimRewards();
        
        this.io.emit('rewards-update', {
          type: 'rewards-claimed',
          result,
          timestamp: Date.now()
        });

        this.sendResponse(res, req, result);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Trigger N8N action
    this.app.post('/api/contract/n8n-action', async (req, res) => {
      try {
        const { txId, threshold } = req.body;
        const result = await this.contractService.triggerN8NAction(txId, threshold);
        
        this.io.emit('n8n-update', {
          type: 'action-triggered',
          result,
          timestamp: Date.now()
        });

        this.sendResponse(res, req, result);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });
  }

  /**
   * Setup N8N Agentic AI routes
   */
  private setupAgenticRoutes(): void {
    // Execute workflow
    this.app.post('/api/agentic/execute', async (req, res) => {
      try {
        const { workflowId, inputData, quantumFactors } = req.body;
        const decision = await n8nAgenticService.executeWorkflow(workflowId, inputData, quantumFactors);
        
        this.io.emit('agentic-update', {
          type: 'workflow-executed',
          workflowId,
          decision,
          timestamp: Date.now()
        });

        this.sendResponse(res, req, decision);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Get workflows status
    this.app.get('/api/agentic/workflows', (req, res) => {
      try {
        const workflows = n8nAgenticService.getWorkflowsStatus();
        this.sendResponse(res, req, workflows);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Get learning metrics
    this.app.get('/api/agentic/learning-metrics', (req, res) => {
      try {
        const metrics = n8nAgenticService.getLearningMetrics();
        this.sendResponse(res, req, metrics);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });
  }

  /**
   * Setup backend service routes
   */
  private setupBackendRoutes(): void {
    // Initialize backend
    this.app.post('/api/backend/initialize', async (req, res) => {
      try {
        await quantumValleyBackendService.initialize();
        this.sendResponse(res, req, { message: 'Backend initialized' });
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Analyze transaction
    this.app.post('/api/backend/analyze', async (req, res) => {
      try {
        const request = req.body;
        const result = await quantumValleyBackendService.analyzeTransaction(request);
        
        this.io.emit('backend-analysis', {
          type: 'analysis-completed',
          result,
          timestamp: Date.now()
        });

        this.sendResponse(res, req, result);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Get algorithm methods
    this.app.get('/api/backend/algorithms', (req, res) => {
      try {
        const methods = quantumValleyBackendService.getAlgorithmMethods();
        this.sendResponse(res, req, methods);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Get workflow state
    this.app.get('/api/backend/workflow-state', (req, res) => {
      try {
        const state = quantumValleyBackendService.getWorkflowState();
        this.sendResponse(res, req, state);
      } catch (error) {
        this.sendError(res, req, error);
      }
    });

    // Reset workflow
    this.app.post('/api/backend/reset', (req, res) => {
      try {
        quantumValleyBackendService.resetWorkflowState();
        this.sendResponse(res, req, { message: 'Workflow reset' });
      } catch (error) {
        this.sendError(res, req, error);
      }
    });
  }

  /**
   * Setup WebSocket connections
   */
  private setupWebSocket(): void {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Subscribe to real-time updates
      socket.on('subscribe-metrics', () => {
        socket.join('metrics-room');
        console.log(`Client ${socket.id} subscribed to metrics`);
      });

      socket.on('subscribe-analysis', () => {
        socket.join('analysis-room');
        console.log(`Client ${socket.id} subscribed to analysis`);
      });

      socket.on('subscribe-training', () => {
        socket.join('training-room');
        console.log(`Client ${socket.id} subscribed to training`);
      });

      // Handle client requests
      socket.on('request-status', async () => {
        try {
          const status = {
            tensorflow: tensorFlowService.getModelSummary(),
            agentic: n8nAgenticService.getWorkflowsStatus(),
            backend: quantumValleyBackendService.getWorkflowState(),
            timestamp: Date.now()
          };
          socket.emit('status-update', status);
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    // Start periodic metrics broadcast
    this.startMetricsBroadcast();
  }

  /**
   * Start periodic metrics broadcast
   */
  private startMetricsBroadcast(): void {
    setInterval(async () => {
      try {
        const metrics = {
          tensorflow: tensorFlowService.getModelSummary(),
          agentic: n8nAgenticService.getLearningMetrics(),
          backend: quantumValleyBackendService.getWorkflowState(),
          timestamp: Date.now()
        };

        this.io.to('metrics-room').emit('metrics-update', metrics);
      } catch (error) {
        console.error('Metrics broadcast error:', error);
      }
    }, 5000); // Every 5 seconds
  }

  /**
   * Send successful response
   */
  private sendResponse<T>(res: express.Response, req: any, data: T): void {
    const executionTime = Date.now() - req.startTime;
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      executionTime,
      quantumSignature: this.generateQuantumSignature(req, data)
    };
    res.json(response);
  }

  /**
   * Send error response
   */
  private sendError(res: express.Response, req: any, error: any): void {
    const executionTime = Date.now() - req.startTime;
    const response: ApiResponse = {
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
      executionTime
    };
    res.status(500).json(response);
  }

  /**
   * Generate quantum signature for response verification
   */
  private generateQuantumSignature(req: any, data: any): string {
    const payload = `${req.method}-${req.path}-${JSON.stringify(data)}-${Date.now()}`;
    return require('crypto').createHash('sha256').update(payload).digest('hex').slice(0, 16);
  }

  /**
   * Start the server
   */
  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, () => {
        console.log(`Quantum API Server running on port ${this.config.port}`);
        console.log(`WebSocket server ready for real-time connections`);
        resolve();
      });
    });
  }

  /**
   * Stop the server
   */
  stop(): void {
    this.server.close();
    console.log('Quantum API Server stopped');
  }
}

// Default configuration
export const DEFAULT_API_CONFIG: ApiServerConfig = {
  port: 3001,
  corsOrigin: ['http://localhost:5173', 'http://localhost:3000'],
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },
  contractConfig: {
    contractAddress: process.env.VITE_CONTRACT_ADDRESS || '',
    providerUrl: process.env.VITE_PROVIDER_URL || 'http://localhost:8545',
    gasLimit: 500000,
    gasPrice: '20000000000'
  }
};