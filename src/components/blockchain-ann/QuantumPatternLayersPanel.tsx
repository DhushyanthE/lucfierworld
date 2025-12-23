/**
 * Quantum Pattern Layers Visualization Panel
 * Displays all 20 quantum security pattern layers with execution status
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Play, RefreshCw, CheckCircle, XCircle, 
  Clock, Zap, Lock, Network, Brain, Waves, Key,
  Radio, Fingerprint, AlertTriangle, Settings, Cpu
} from 'lucide-react';
import { useQuantumPatternLayers, PatternLayerResult } from '@/hooks/useQuantumPatternLayers';

const LAYER_ICONS: Record<string, React.ReactNode> = {
  'entanglement-init': <Network className="h-4 w-4" />,
  'superposition-gate': <Waves className="h-4 w-4" />,
  'phase-encoding': <Radio className="h-4 w-4" />,
  'echo-propagation': <Zap className="h-4 w-4" />,
  'interference-check': <AlertTriangle className="h-4 w-4" />,
  'decoherence-guard': <Shield className="h-4 w-4" />,
  'key-distribution': <Key className="h-4 w-4" />,
  'bell-state-verify': <CheckCircle className="h-4 w-4" />,
  'quantum-signature': <Fingerprint className="h-4 w-4" />,
  'error-correction': <Settings className="h-4 w-4" />,
  'tomography-scan': <Cpu className="h-4 w-4" />,
  'fidelity-assessment': <CheckCircle className="h-4 w-4" />,
  'noise-mitigation': <Shield className="h-4 w-4" />,
  'coherence-extension': <Clock className="h-4 w-4" />,
  'multi-party-sync': <Network className="h-4 w-4" />,
  'blockchain-anchor': <Lock className="h-4 w-4" />,
  'neural-validation': <Brain className="h-4 w-4" />,
  'consensus-gate': <Network className="h-4 w-4" />,
  'echo-finalization': <Waves className="h-4 w-4" />,
  'transfer-complete': <CheckCircle className="h-4 w-4" />
};

function LayerCard({ layer, result, isActive }: { 
  layer: { key: string; id: number; name: string; description: string };
  result?: PatternLayerResult;
  isActive: boolean;
}) {
  const icon = LAYER_ICONS[layer.key] || <Shield className="h-4 w-4" />;
  const passed = result?.passed;
  const score = result?.score || 0;

  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isActive ? 'border-primary bg-primary/5 animate-pulse' :
      result ? (passed ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5') :
      'border-border bg-card'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            passed ? 'bg-green-500/20 text-green-500' :
            result ? 'bg-red-500/20 text-red-500' :
            'bg-muted text-muted-foreground'
          }`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Layer {layer.id}</span>
              {result && (
                passed ? <CheckCircle className="h-3 w-3 text-green-500" /> :
                <XCircle className="h-3 w-3 text-red-500" />
              )}
            </div>
            <h4 className="font-medium text-sm">{layer.name}</h4>
          </div>
        </div>
        {result && (
          <Badge variant={passed ? 'default' : 'destructive'}>
            {score.toFixed(0)}%
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{layer.description}</p>
      {result && (
        <Progress value={score} className="mt-2 h-1" />
      )}
    </div>
  );
}

export function QuantumPatternLayersPanel() {
  const { 
    isLoading, 
    layers, 
    executionResult, 
    currentLayerIndex,
    listLayers, 
    executeAllLayers,
    resetExecution 
  } = useQuantumPatternLayers();
  
  const [activeTab, setActiveTab] = useState('layers');
  const [animatedLayers, setAnimatedLayers] = useState<PatternLayerResult[]>([]);

  useEffect(() => {
    listLayers();
  }, [listLayers]);

  const handleExecuteAll = async () => {
    setAnimatedLayers([]);
    await executeAllLayers({}, (layer, index) => {
      setAnimatedLayers(prev => [...prev, layer]);
    });
  };

  const getResultForLayer = (layerKey: string) => {
    return executionResult?.layers.find(l => l.key === layerKey);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>20 Quantum Pattern Security Layers</CardTitle>
                <CardDescription>
                  Complete quantum-resistant security protocol implementation
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {executionResult && (
                <Button variant="outline" size="sm" onClick={resetExecution}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
              <Button onClick={handleExecuteAll} disabled={isLoading}>
                <Play className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Executing...' : 'Execute All Layers'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Summary */}
        {executionResult && (
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-background">
                <p className="text-sm text-muted-foreground">Layers Passed</p>
                <p className="text-2xl font-bold text-green-500">
                  {executionResult.summary.passedLayers} / {executionResult.summary.totalLayers}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-bold">
                  {(executionResult.summary.overallScore * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="text-sm text-muted-foreground">Security Level</p>
                <Badge variant={
                  executionResult.summary.securityLevel === 'maximum' ? 'default' :
                  executionResult.summary.securityLevel === 'high' ? 'secondary' : 'outline'
                } className="mt-1">
                  {executionResult.summary.securityLevel.toUpperCase()}
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-background">
                <p className="text-sm text-muted-foreground">Transfer Status</p>
                <Badge variant={executionResult.summary.transferReady ? 'default' : 'destructive'} className="mt-1">
                  {executionResult.summary.transferReady ? 'READY' : 'NOT READY'}
                </Badge>
              </div>
            </div>
            <Progress 
              value={executionResult.summary.passedLayers / executionResult.summary.totalLayers * 100} 
              className="mt-4 h-2" 
            />
          </CardContent>
        )}
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="layers">All Layers</TabsTrigger>
          <TabsTrigger value="details">Execution Details</TabsTrigger>
          <TabsTrigger value="contract">Solidity Contract</TabsTrigger>
        </TabsList>

        <TabsContent value="layers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {layers.map((layer) => (
              <LayerCard 
                key={layer.key}
                layer={layer}
                result={getResultForLayer(layer.key)}
                isActive={currentLayerIndex === layer.id - 1}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {executionResult ? (
            <Card>
              <CardHeader>
                <CardTitle>Execution Results</CardTitle>
                <CardDescription>
                  Detailed results for each pattern layer execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {executionResult.layers.map((layer) => (
                      <div key={layer.key} className="p-4 rounded-lg border bg-card">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Layer {layer.layerId}</Badge>
                            <span className="font-medium">{layer.layer}</span>
                          </div>
                          <Badge variant={layer.passed ? 'default' : 'destructive'}>
                            {layer.passed ? 'PASSED' : 'FAILED'} - {layer.score.toFixed(1)}%
                          </Badge>
                        </div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(layer.result, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Execute all layers to see detailed results
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contract" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solidity Smart Contract</CardTitle>
              <CardDescription>
                QuantumPatternLayers.sol - Blockchain implementation of the 20 security layers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract QuantumPatternLayers {
    
    struct QuantumSession {
        bytes32 sessionId;
        address sender;
        address receiver;
        uint8 currentLayer;
        bool[20] layersPassed;
        uint256 overallFidelity;
        bool isComplete;
        bool isSecure;
    }
    
    mapping(bytes32 => QuantumSession) public sessions;
    
    string[20] public layerNames = [
        "Entanglement-Init",
        "Superposition-Gate", 
        "Phase-Encoding",
        "Echo-Propagation",
        "Interference-Check",
        "Decoherence-Guard",
        "Key-Distribution",
        "Bell-State-Verify",
        "Quantum-Signature",
        "Error-Correction",
        "Tomography-Scan",
        "Fidelity-Assessment",
        "Noise-Mitigation",
        "Coherence-Extension",
        "Multi-Party-Sync",
        "Blockchain-Anchor",
        "Neural-Validation",
        "Consensus-Gate",
        "Echo-Finalization",
        "Transfer-Complete"
    ];
    
    function initSession(address _receiver) external returns (bytes32);
    function entanglementInit(bytes32 _sessionId, uint256 _eprPairs) external returns (bool);
    function superpositionGate(bytes32 _sessionId, uint256 _hadamardGates) external returns (bool);
    function phaseEncoding(bytes32 _sessionId, uint256 _bitsEncoded, string calldata _basis) external returns (bool);
    function echoPropagation(bytes32 _sessionId, uint256 _signalStrength) external returns (bool);
    function interferenceCheck(bytes32 _sessionId, bool _eavesdroppingDetected) external returns (bool);
    function decoherenceGuard(bytes32 _sessionId, uint256 _pulsesApplied) external returns (bool);
    function keyDistribution(bytes32 _sessionId, uint256 _keyLength) external returns (bool);
    function bellStateVerify(bytes32 _sessionId, uint256 _fidelity) external returns (bool);
    function quantumSignature(bytes32 _sessionId, bytes32 _signatureHash) external returns (bool);
    function errorCorrection(bytes32 _sessionId, uint256 _errorsFixed) external returns (bool);
    function tomographyScan(bytes32 _sessionId, uint256 _purity) external returns (bool);
    function fidelityAssessment(bytes32 _sessionId, uint256 _fidelity) external returns (bool);
    function noiseMitigation(bytes32 _sessionId, uint256 _effectiveness) external returns (bool);
    function coherenceExtension(bytes32 _sessionId, uint256 _extensionFactor) external returns (bool);
    function multiPartySync(bytes32 _sessionId, uint256 _nodes, bool _synced) external returns (bool);
    function blockchainAnchor(bytes32 _sessionId, bytes32 _dataHash) external returns (bool);
    function neuralValidation(bytes32 _sessionId, uint256 _confidence, bool _anomalyFree) external returns (bool);
    function consensusGate(bytes32 _sessionId, uint256 _participants, bool _agreed) external returns (bool);
    function echoFinalization(bytes32 _sessionId, uint256 _amplitude) external returns (bool);
    function transferComplete(bytes32 _sessionId, uint256 _totalBits) external returns (bool);
}`}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
