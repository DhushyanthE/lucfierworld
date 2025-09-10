
import React, { useState } from 'react';
import { AppLayout } from "@/components/layout/AppLayout";
import { QuantumVisualization } from '@/components/quantum/QuantumVisualization';
import { IoTDataVisualization } from '@/components/iot/IoTDataVisualization';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, Code, Globe, Database, Layers, Shield, Cpu, Network } from 'lucide-react';
import { toast } from 'sonner';

export default function AGIDashboard() {
  const [workflowStep, setWorkflowStep] = useState(0);
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
  
  const runWorkflow = () => {
    setWorkflowStatus('running');
    setWorkflowStep(0);
    
    toast.info("AGI workflow started", {
      description: "Initializing data ingestion and processing"
    });
    
    // Simulate workflow steps
    const stepIntervals = [3000, 2000, 4000, 2500, 3000];
    
    let currentStep = 0;
    const runNextStep = () => {
      currentStep++;
      setWorkflowStep(currentStep);
      
      if (currentStep >= stepIntervals.length) {
        setWorkflowStatus('complete');
        toast.success("AGI workflow completed", {
          description: "All steps processed successfully"
        });
      } else {
        setTimeout(runNextStep, stepIntervals[currentStep]);
      }
    };
    
    // Start the workflow simulation
    setTimeout(runNextStep, stepIntervals[0]);
  };
  
  const resetWorkflow = () => {
    setWorkflowStatus('idle');
    setWorkflowStep(0);
    toast.info("Workflow reset", {
      description: "The system is ready for a new processing run"
    });
  };
  
  const workflowSteps = [
    {
      title: "IoT Data Ingestion",
      icon: <Database className="h-5 w-5 mr-2" />,
      description: "Collecting and normalizing IoT device data streams from sensors."
    },
    {
      title: "Anomaly Detection",
      icon: <Shield className="h-5 w-5 mr-2" />,
      description: "Running ML models to detect anomalies in the incoming data."
    },
    {
      title: "AGI Orchestration",
      icon: <BrainCircuit className="h-5 w-5 mr-2" />,
      description: "Activating multi-agent reasoning on detected anomalies."
    },
    {
      title: "Smart Contract Generation",
      icon: <Code className="h-5 w-5 mr-2" />,
      description: "Generating and validating smart contract code for on-chain execution."
    },
    {
      title: "Blockchain Settlement",
      icon: <Globe className="h-5 w-5 mr-2" />,
      description: "Submitting transactions to the blockchain and monitoring events."
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <BrainCircuit className="h-8 w-8 mr-3 text-purple-500" />
            AGI-Driven Web3 Dashboard
          </h1>
          
          <div className="flex space-x-4">
            {workflowStatus === 'idle' && (
              <Button 
                onClick={runWorkflow}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <BrainCircuit className="h-4 w-4 mr-2" />
                Run AGI Workflow
              </Button>
            )}
            
            {(workflowStatus === 'running' || workflowStatus === 'complete') && (
              <Button 
                onClick={resetWorkflow}
                variant="outline"
              >
                Reset Workflow
              </Button>
            )}
          </div>
        </div>

        {/* Workflow Status */}
        <Card className="bg-gray-900/70 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center">
              <Layers className="h-5 w-5 text-purple-400 mr-2" />
              AGI Workflow Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              {workflowSteps.map((step, index) => (
                <React.Fragment key={index}>
                  <div 
                    className={`relative flex flex-col items-center ${
                      index <= workflowStep && workflowStatus !== 'idle' 
                        ? 'opacity-100' 
                        : 'opacity-50'
                    }`}
                  >
                    <div className={`
                      h-12 w-12 rounded-full flex items-center justify-center
                      ${index < workflowStep && workflowStatus !== 'idle' ? 'bg-green-600' : 
                        index === workflowStep && workflowStatus === 'running' ? 'bg-blue-600 animate-pulse' :
                        index === workflowStep && workflowStatus === 'complete' ? 'bg-green-600' :
                        'bg-gray-700'}
                    `}>
                      {step.icon}
                    </div>
                    <div className="mt-2 text-center max-w-[120px]">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-gray-400 mt-1 hidden md:block">{step.description}</p>
                    </div>
                  </div>
                  
                  {index < workflowSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 ${
                      index < workflowStep && workflowStatus !== 'idle'
                        ? 'bg-green-600'
                        : 'bg-gray-700'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
          <CardFooter className="text-xs text-gray-400">
            {workflowStatus === 'idle' && "System ready. Start the workflow to process data through the AGI pipeline."}
            {workflowStatus === 'running' && `Processing step ${workflowStep + 1} of ${workflowSteps.length}: ${workflowSteps[workflowStep].title}`}
            {workflowStatus === 'complete' && "Workflow completed successfully. The results are available in the visualizations below."}
            {workflowStatus === 'error' && "An error occurred during workflow execution. Please check the logs and try again."}
          </CardFooter>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QuantumVisualization 
            activeMode={workflowStep >= 2 ? 'quantum' : 'neural'} 
            initialState={workflowStatus === 'running' ? 'processing' : 'stable'}
          />
          <IoTDataVisualization />
        </div>

        {/* Architecture Overview */}
        <Card className="bg-gray-900/70 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">
              <Network className="h-5 w-5 inline mr-2 text-purple-400" />
              System Architecture Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="iot-cloud">IoT & Cloud</TabsTrigger>
                <TabsTrigger value="agi-ml">AGI & ML</TabsTrigger>
                <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="text-sm text-gray-300">
                <p>
                  This system represents an advanced AGI-driven Web3 workflow that integrates IoT data collection,
                  real-time anomaly detection, intelligent processing through an AGI Orchestrator, and blockchain settlement.
                  The architecture creates a closed-loop, self-improving network that continuously adapts to new data patterns.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-800/50 p-3 rounded">
                    <h4 className="text-purple-400 font-medium flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      Data Flow
                    </h4>
                    <p className="mt-1 text-xs">IoT → Ingest → Event Bus → Processing → AGI → Blockchain → Frontend</p>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded">
                    <h4 className="text-purple-400 font-medium flex items-center">
                      <Cpu className="h-4 w-4 mr-2" />
                      Computing Resources
                    </h4>
                    <p className="mt-1 text-xs">Containerized microservices with auto-scaling based on workload</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="iot-cloud" className="text-sm text-gray-300">
                <p>
                  The IoT & Cloud layer consists of edge devices collecting data and sending it through secure channels
                  to the Ingest Service, which normalizes payloads and publishes to the Event Bus.
                  Cloud resources dynamically scale based on incoming data volume and processing needs.
                </p>
                <div className="mt-4 bg-black/30 p-3 rounded font-mono text-xs overflow-auto">
                  <pre>
{`// Example device data ingestion
const ingestService = {
  authorizeDevice: async (deviceId, token) => { /* Auth logic */ },
  normalizePayload: (data) => {
    // Normalize structure
    return {
      deviceId: data.id,
      timestamp: Date.now(),
      metrics: data.readings,
      metadata: data.meta
    };
  },
  publishToEventBus: async (topic, message) => {
    // Publish to SNS/Kafka
    await eventBus.publish(topic, message);
  }
};`}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="agi-ml" className="text-sm text-gray-300">
                <p>
                  The AGI & ML pipeline uses real-time anomaly detection with Z-score calculations and reinforcement learning
                  for dynamic threshold tuning. The AGI Orchestrator manages multiple agents for different tasks and
                  continuously improves through feedback loops.
                </p>
                <div className="mt-4 bg-black/30 p-3 rounded font-mono text-xs overflow-auto">
                  <pre>
{`// AGI Orchestrator example
class AgiOrchestrator {
  constructor() {
    this.agents = {
      anomalyAnalyzer: new Agent('analyze'),
      planningAgent: new Agent('plan'),
      codeGenerator: new Agent('generate'),
      performanceMonitor: new Agent('monitor')
    };
  }
  
  async processAnomaly(anomalyData) {
    // 1. Analyze the anomaly
    const analysis = await this.agents.anomalyAnalyzer.process(anomalyData);
    
    // 2. Create a plan
    const plan = await this.agents.planningAgent.process({
      anomaly: anomalyData,
      analysis
    });
    
    // 3. Generate smart contract code
    const contractCode = await this.agents.codeGenerator.process(plan);
    
    // 4. Monitor execution
    return this.agents.performanceMonitor.track(contractCode);
  }
}`}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="blockchain" className="text-sm text-gray-300">
                <p>
                  The Blockchain layer includes an Oracle Service for submitting transactions to the Layer-1 blockchain
                  and listening for events. The Off-chain Indexer persists blockchain data to databases and provides
                  real-time updates to the frontend.
                </p>
                <div className="mt-4 bg-black/30 p-3 rounded font-mono text-xs overflow-auto">
                  <pre>
{`// Blockchain Oracle example
const blockchainOracle = {
  async submitTransaction(contractAddress, method, params) {
    const tx = await web3.eth.Contract(ABI, contractAddress)
      .methods[method](...params)
      .send({ from: ORACLE_ADDRESS });
      
    console.log(\`Transaction submitted: \${tx.transactionHash}\`);
    return tx;
  },
  
  listenForEvents(contractAddress, eventName, callback) {
    web3.eth.Contract(ABI, contractAddress)
      .events[eventName]()
      .on('data', async (event) => {
        // Process event
        await callback(event);
        
        // Index in database
        await offchainIndexer.indexEvent(event);
      });
  }
};`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
