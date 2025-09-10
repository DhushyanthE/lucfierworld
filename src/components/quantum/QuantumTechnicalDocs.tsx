
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Code, Cpu, Book, BookOpen, TerminalSquare, ChevronRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QuantumTechnicalDocs() {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState<string | null>(null);
  
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" />
            Quantum Technical Documentation
            <Badge className="ml-2 bg-blue-800 text-blue-300">v2.5.0</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span>API</span>
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-1">
              <TerminalSquare className="h-4 w-4" />
              <span>Examples</span>
            </TabsTrigger>
            <TabsTrigger value="specs" className="flex items-center gap-1">
              <Book className="h-4 w-4" />
              <span>Specs</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="bg-gradient-to-br from-black to-blue-950/20 p-4 rounded-lg border border-blue-500/20">
              <div className="text-xl text-white mb-2 font-medium">Quantum Intelligence Platform</div>
              <p className="text-sm text-gray-300 mb-3">
                The Quantum Intelligence Platform combines quantum computing with advanced AI to deliver unprecedented computational power and intelligence capabilities.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="text-sm text-blue-300 font-medium mb-2 flex items-center">
                    <Cpu className="h-4 w-4 mr-1.5" />
                    Core Technologies
                  </div>
                  <ul className="text-xs text-gray-300 space-y-2">
                    <li className="flex items-start">
                      <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                      <span><span className="text-blue-300">Quantum Processing:</span> 128-bit quantum processor with error correction</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                      <span><span className="text-blue-300">Neural Network Integration:</span> Quantum-enhanced neural architecture</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                      <span><span className="text-blue-300">AGI Framework:</span> Artificial General Intelligence with quantum advantage</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                      <span><span className="text-blue-300">Quantum Blockchain:</span> Post-quantum cryptographic security layer</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="text-sm text-blue-300 font-medium mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-1.5" />
                    Documentation Sections
                  </div>
                  <ul className="text-xs text-gray-300 space-y-2">
                    <li className="flex items-start">
                      <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                      <span><span className="text-blue-300">Getting Started:</span> Platform introduction and setup guides</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                      <span><span className="text-blue-300">API Reference:</span> Comprehensive API documentation</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                      <span><span className="text-blue-300">Tutorials:</span> Step-by-step guides and examples</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                      <span><span className="text-blue-300">Technical Specifications:</span> Detailed system architecture</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-300 font-medium mb-2">Release Notes</div>
                <Badge className="mb-2">v2.5.0 - Latest</Badge>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Added quantum neural network layer</li>
                  <li>• Enhanced quantum cryptography module</li>
                  <li>• Improved AGI cognitive processing</li>
                  <li>• Optimized quantum circuit performance</li>
                </ul>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-300 font-medium mb-2">System Requirements</div>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• 64-bit processing architecture</li>
                  <li>• 16GB memory minimum</li>
                  <li>• CUDA-compatible GPU</li>
                  <li>• Quantum API access key</li>
                  <li>• Node.js 16+ / Python 3.10+</li>
                </ul>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="text-sm text-gray-300 font-medium mb-2">Resources</div>
                <div className="space-y-2 text-xs">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700"
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    Full Documentation PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700"
                  >
                    <Code className="h-3 w-3 mr-2" />
                    GitHub Repository
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full justify-start bg-gray-800 border-gray-700 hover:bg-gray-700"
                  >
                    <Book className="h-3 w-3 mr-2" />
                    Academic Papers
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-4">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-blue-300 font-medium">Quantum API Reference</div>
                <Badge>REST / GraphQL</Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white mb-2">Authentication</div>
                  <div className="bg-black/80 rounded-md p-3 font-mono text-xs text-gray-300 relative">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0 absolute right-2 top-2"
                      onClick={() => handleCopy(`const apiKey = 'YOUR_QUANTUM_API_KEY';
const headers = {
  'Authorization': \`Bearer \${apiKey}\`,
  'Content-Type': 'application/json'
};`, 'auth')}
                    >
                      {copied === 'auth' ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                    <pre>{`const apiKey = 'YOUR_QUANTUM_API_KEY';
const headers = {
  'Authorization': \`Bearer \${apiKey}\`,
  'Content-Type': 'application/json'
};`}</pre>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-white mb-2">Quantum Processing Request</div>
                  <div className="bg-black/80 rounded-md p-3 font-mono text-xs text-gray-300 relative">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0 absolute right-2 top-2"
                      onClick={() => handleCopy(`// Execute quantum computation
const response = await fetch('https://api.quantum.ai/v1/compute', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    circuit: {
      qubits: 8,
      gates: [
        { type: 'h', targets: [0] },
        { type: 'cx', controls: [0], targets: [1] },
        { type: 'measure', targets: [0, 1] }
      ]
    },
    shots: 1000
  })
});

const result = await response.json();
console.log(result.measurements);`, 'compute')}
                    >
                      {copied === 'compute' ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                    <pre>{`// Execute quantum computation
const response = await fetch('https://api.quantum.ai/v1/compute', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    circuit: {
      qubits: 8,
      gates: [
        { type: 'h', targets: [0] },
        { type: 'cx', controls: [0], targets: [1] },
        { type: 'measure', targets: [0, 1] }
      ]
    },
    shots: 1000
  })
});

const result = await response.json();
console.log(result.measurements);`}</pre>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <div className="text-sm text-gray-300 font-medium mb-3">API Endpoints</div>
              
              <div className="space-y-3">
                <div className="border border-gray-700 rounded-md">
                  <div className="flex justify-between items-center p-2 border-b border-gray-700 bg-black/20">
                    <div className="flex items-center">
                      <Badge className="bg-green-900 text-green-300 mr-2">GET</Badge>
                      <span className="text-xs text-white font-mono">/v1/quantum/status</span>
                    </div>
                    <span className="text-xs text-gray-400">System status</span>
                  </div>
                  <div className="p-2 text-xs text-gray-400">
                    Returns the current status of the quantum computing system, including availability and queue time.
                  </div>
                </div>
                
                <div className="border border-gray-700 rounded-md">
                  <div className="flex justify-between items-center p-2 border-b border-gray-700 bg-black/20">
                    <div className="flex items-center">
                      <Badge className="bg-blue-900 text-blue-300 mr-2">POST</Badge>
                      <span className="text-xs text-white font-mono">/v1/compute</span>
                    </div>
                    <span className="text-xs text-gray-400">Execute quantum circuit</span>
                  </div>
                  <div className="p-2 text-xs text-gray-400">
                    Run a quantum circuit and return measurement results. Supports up to 128 qubits with error correction.
                  </div>
                </div>
                
                <div className="border border-gray-700 rounded-md">
                  <div className="flex justify-between items-center p-2 border-b border-gray-700 bg-black/20">
                    <div className="flex items-center">
                      <Badge className="bg-purple-900 text-purple-300 mr-2">POST</Badge>
                      <span className="text-xs text-white font-mono">/v1/ai/quantum-ml</span>
                    </div>
                    <span className="text-xs text-gray-400">Quantum machine learning</span>
                  </div>
                  <div className="p-2 text-xs text-gray-400">
                    Execute quantum-enhanced machine learning algorithms on provided datasets.
                  </div>
                </div>
                
                <div className="border border-gray-700 rounded-md">
                  <div className="flex justify-between items-center p-2 border-b border-gray-700 bg-black/20">
                    <div className="flex items-center">
                      <Badge className="bg-yellow-900 text-yellow-300 mr-2">POST</Badge>
                      <span className="text-xs text-white font-mono">/v1/quantum/entangle</span>
                    </div>
                    <span className="text-xs text-gray-400">Quantum entanglement</span>
                  </div>
                  <div className="p-2 text-xs text-gray-400">
                    Generate and manage quantum entangled particles for secure communication channels.
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <div className="text-sm text-blue-300 font-medium mb-3">Code Examples</div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white mb-2">Quantum Neural Network</div>
                  <div className="bg-black/80 rounded-md p-3 font-mono text-xs text-gray-300 relative">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0 absolute right-2 top-2"
                      onClick={() => handleCopy(`import { createQuantumAIModel, trainQuantumAIModel } from '@quantum/ai';

// Create a quantum neural network model
const model = createQuantumAIModel(
  inputDim: 10,
  outputDim: 2,
  hiddenLayers: [64, 32]
);

// Training data for binary classification
const trainingData = [
  { input: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], target: [1, 0] },
  { input: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1], target: [0, 1] },
  // ... more training examples
];

// Train with quantum-enhanced backpropagation
const result = await trainQuantumAIModel(model, trainingData, {
  learningRate: 0.01,
  epochs: 100,
  batchSize: 10,
  quantumNoiseLevel: 0.05,
  errorCorrectionStrength: 0.2,
  useQuantumBackpropagation: true
});

console.log(\`Training complete. Accuracy: \${result.trainingMetrics.finalAccuracy * 100}%\`);
console.log(\`Quantum advantage: \${result.trainingMetrics.quantumAdvantageScore}\`);`, 'qnn')}
                    >
                      {copied === 'qnn' ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                    <pre>{`import { createQuantumAIModel, trainQuantumAIModel } from '@quantum/ai';

// Create a quantum neural network model
const model = createQuantumAIModel(
  inputDim: 10,
  outputDim: 2,
  hiddenLayers: [64, 32]
);

// Training data for binary classification
const trainingData = [
  { input: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], target: [1, 0] },
  { input: [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1], target: [0, 1] },
  // ... more training examples
];

// Train with quantum-enhanced backpropagation
const result = await trainQuantumAIModel(model, trainingData, {
  learningRate: 0.01,
  epochs: 100,
  batchSize: 10,
  quantumNoiseLevel: 0.05,
  errorCorrectionStrength: 0.2,
  useQuantumBackpropagation: true
});

console.log(\`Training complete. Accuracy: \${result.trainingMetrics.finalAccuracy * 100}%\`);
console.log(\`Quantum advantage: \${result.trainingMetrics.quantumAdvantageScore}\`);`}</pre>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-white mb-2">Quantum Blockchain Integration</div>
                  <div className="bg-black/80 rounded-md p-3 font-mono text-xs text-gray-300 relative">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0 absolute right-2 top-2"
                      onClick={() => handleCopy(`import { processBlockchainTask } from '@quantum/blockchain';

// Analyze blockchain security against quantum attacks
const securityAnalysis = await processBlockchainTask({
  id: 'task-' + Date.now(),
  type: 'security',
  status: 'queued',
  priority: 2,
  data: {
    operation: 'analyze-blockchain-security',
    algorithm: 'ECDSA',
    keySize: 256
  }
});

console.log('Security Analysis Results:');
console.log(\`Algorithm: \${securityAnalysis.algorithm}\`);
console.log(\`Quantum Vulnerability: \${securityAnalysis.quantumVulnerable ? 'Yes' : 'No'}\`);
console.log(\`Attack Vector: \${securityAnalysis.attackVector}\`);
console.log(\`Quantum Bit Security: \${securityAnalysis.quantumBitSecurity}\`);
console.log('Recommendations:');
securityAnalysis.recommendations.forEach((rec, i) => {
  console.log(\`\${i + 1}. \${rec}\`);
});`, 'blockchain')}
                    >
                      {copied === 'blockchain' ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                    <pre>{`import { processBlockchainTask } from '@quantum/blockchain';

// Analyze blockchain security against quantum attacks
const securityAnalysis = await processBlockchainTask({
  id: 'task-' + Date.now(),
  type: 'security',
  status: 'queued',
  priority: 2,
  data: {
    operation: 'analyze-blockchain-security',
    algorithm: 'ECDSA',
    keySize: 256
  }
});

console.log('Security Analysis Results:');
console.log(\`Algorithm: \${securityAnalysis.algorithm}\`);
console.log(\`Quantum Vulnerability: \${securityAnalysis.quantumVulnerable ? 'Yes' : 'No'}\`);
console.log(\`Attack Vector: \${securityAnalysis.attackVector}\`);
console.log(\`Quantum Bit Security: \${securityAnalysis.quantumBitSecurity}\`);
console.log('Recommendations:');
securityAnalysis.recommendations.forEach((rec, i) => {
  console.log(\`\${i + 1}. \${rec}\`);
});`}</pre>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-black/40 p-4 rounded-lg border border-blue-500/30">
              <div className="text-sm text-blue-300 mb-2">Tutorials & Guides</div>
              <ul className="grid grid-cols-2 gap-3 text-xs text-gray-300">
                <li className="flex items-start">
                  <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                  <span>Getting Started with Quantum Processing</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                  <span>Building Your First Quantum Neural Network</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                  <span>Quantum Circuit Optimization Guide</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                  <span>Implementing Quantum-Secure Blockchain</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                  <span>AGI Integration Patterns & Best Practices</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                  <span>Quantum Data Science with Python</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                  <span>Quantum IoT Device Integration</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                  <span>Quantum Cloud Computing Architecture</span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="specs" className="space-y-4">
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
              <div className="text-sm text-blue-300 font-medium mb-3">Technical Specifications</div>
              
              <div className="space-y-4">
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-white mb-2">Quantum Processing Unit</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Architecture: Superconducting transmon qubits</li>
                    <li>• Qubits: 128 physical qubits (42 logical qubits with error correction)</li>
                    <li>• Coherence Time: 250 microseconds</li>
                    <li>• Gate Fidelity: 99.98% (single-qubit), 99.5% (two-qubit)</li>
                    <li>• Error Correction: Surface code with 3:1 physical-to-logical qubit ratio</li>
                    <li>• Quantum Volume: 2^32</li>
                  </ul>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-white mb-2">Neural Network Architecture</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Model Type: Hybrid quantum-classical neural network</li>
                    <li>• Layers: Variable depth (up to 32 layers)</li>
                    <li>• Quantum Layers: Variational quantum circuits with parameterized rotation gates</li>
                    <li>• Classical Layers: Dense, convolutional, attention mechanisms</li>
                    <li>• Optimization: Quantum-enhanced gradient descent</li>
                    <li>• Training Methods: Supervised, unsupervised, reinforcement learning</li>
                  </ul>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-white mb-2">AGI Cognitive System</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Cognitive Architecture: Hybrid symbolic-connectionist system</li>
                    <li>• Reasoning Methods: Deductive, inductive, abductive, causal</li>
                    <li>• Knowledge Representation: Graph-based with quantum entanglement properties</li>
                    <li>• Learning Rate: Adaptive with quantum speedup (450x classical systems)</li>
                    <li>• Decision Making: Multi-objective optimization with quantum annealing</li>
                    <li>• Meta-cognition: Self-monitoring and recursive self-improvement capabilities</li>
                  </ul>
                </div>
                
                <div className="bg-black/40 p-3 rounded-lg border border-gray-800">
                  <div className="text-xs text-white mb-2">Quantum Blockchain Specifications</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Consensus: Quantum-resistant proof-of-stake</li>
                    <li>• Cryptography: Post-quantum lattice-based signatures</li>
                    <li>• Key Distribution: Quantum key distribution (QKD)</li>
                    <li>• Transaction Speed: 10,000+ TPS</li>
                    <li>• Security: Resistant to quantum and classical attacks</li>
                    <li>• Authentication: Quantum entanglement verification</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-black to-purple-950/20 p-4 rounded-lg border border-purple-500/20">
              <div className="text-sm text-purple-300 font-medium mb-3">Quantum Advantage Benchmarks</div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Machine Learning</span>
                  <div className="flex items-center">
                    <span className="text-xs text-green-400 mr-1">450x</span>
                    <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{width: "90%"}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Optimization Problems</span>
                  <div className="flex items-center">
                    <span className="text-xs text-green-400 mr-1">380x</span>
                    <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{width: "76%"}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Cryptographic Operations</span>
                  <div className="flex items-center">
                    <span className="text-xs text-green-400 mr-1">520x</span>
                    <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{width: "95%"}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Database Search</span>
                  <div className="flex items-center">
                    <span className="text-xs text-green-400 mr-1">312x</span>
                    <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{width: "65%"}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Simulation Performance</span>
                  <div className="flex items-center">
                    <span className="text-xs text-green-400 mr-1">640x</span>
                    <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{width: "98%"}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
