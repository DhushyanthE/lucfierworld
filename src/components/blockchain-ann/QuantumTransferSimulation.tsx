/**
 * Quantum Transfer Simulation
 * Executes all 20 pattern layers sequentially with visual progress animation
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, Play, RotateCcw, CheckCircle, XCircle, 
  Zap, ArrowRight, Lock, Send, Timer, Sparkles
} from 'lucide-react';
import { useQuantumPatternLayers, PatternLayerResult } from '@/hooks/useQuantumPatternLayers';
import { toast } from 'sonner';

const LAYER_NAMES = [
  'Entanglement-Init',
  'Superposition-Gate',
  'Phase-Encoding',
  'Echo-Propagation',
  'Interference-Check',
  'Decoherence-Guard',
  'Key-Distribution',
  'Bell-State-Verify',
  'Quantum-Signature',
  'Error-Correction',
  'Tomography-Scan',
  'Fidelity-Assessment',
  'Noise-Mitigation',
  'Coherence-Extension',
  'Multi-Party-Sync',
  'Blockchain-Anchor',
  'Neural-Validation',
  'Consensus-Gate',
  'Echo-Finalization',
  'Transfer-Complete'
];

interface TransferConfig {
  sender: string;
  receiver: string;
  amount: string;
  dataPayload: string;
}

export function QuantumTransferSimulation() {
  const { isLoading, executeAllLayers, resetExecution } = useQuantumPatternLayers();
  
  const [config, setConfig] = useState<TransferConfig>({
    sender: '0x' + Math.random().toString(16).substr(2, 40),
    receiver: '0x' + Math.random().toString(16).substr(2, 40),
    amount: '1000',
    dataPayload: 'Secure quantum transfer payload'
  });
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(-1);
  const [layerResults, setLayerResults] = useState<PatternLayerResult[]>([]);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const handleStartSimulation = useCallback(async () => {
    setIsSimulating(true);
    setCurrentLayer(0);
    setLayerResults([]);
    setSimulationComplete(false);
    setStartTime(new Date());
    setEndTime(null);

    toast.info('Quantum Transfer Initiated', {
      description: 'Executing 20 security pattern layers...'
    });

    try {
      await executeAllLayers(
        {
          sender: config.sender,
          receiver: config.receiver,
          amount: parseFloat(config.amount),
          payload: config.dataPayload
        },
        (result, index) => {
          setCurrentLayer(index + 1);
          setLayerResults(prev => [...prev, result]);
        }
      );

      setSimulationComplete(true);
      setEndTime(new Date());
      
      toast.success('Quantum Transfer Complete', {
        description: 'All 20 pattern layers executed successfully'
      });
    } catch (error) {
      toast.error('Transfer Failed', {
        description: 'An error occurred during simulation'
      });
    } finally {
      setIsSimulating(false);
    }
  }, [config, executeAllLayers]);

  const handleReset = () => {
    setCurrentLayer(-1);
    setLayerResults([]);
    setSimulationComplete(false);
    setStartTime(null);
    setEndTime(null);
    resetExecution();
  };

  const getProgressPercentage = () => {
    return (layerResults.length / 20) * 100;
  };

  const getPassedCount = () => {
    return layerResults.filter(r => r.passed).length;
  };

  const getAverageScore = () => {
    if (layerResults.length === 0) return 0;
    return layerResults.reduce((acc, r) => acc + r.score, 0) / layerResults.length;
  };

  const getElapsedTime = () => {
    if (!startTime) return 0;
    const end = endTime || new Date();
    return Math.round((end.getTime() - startTime.getTime()) / 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Quantum Transfer Simulation</CardTitle>
                <CardDescription>
                  Execute all 20 quantum security pattern layers for secure data transfer
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={simulationComplete ? 'default' : isSimulating ? 'secondary' : 'outline'}
              className="text-sm px-3 py-1"
            >
              {simulationComplete ? 'COMPLETE' : isSimulating ? 'SIMULATING' : 'READY'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transfer Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sender Address</Label>
              <Input 
                value={config.sender}
                onChange={(e) => setConfig(prev => ({ ...prev, sender: e.target.value }))}
                disabled={isSimulating}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>Receiver Address</Label>
              <Input 
                value={config.receiver}
                onChange={(e) => setConfig(prev => ({ ...prev, receiver: e.target.value }))}
                disabled={isSimulating}
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount (Quantum Units)</Label>
              <Input 
                type="number"
                value={config.amount}
                onChange={(e) => setConfig(prev => ({ ...prev, amount: e.target.value }))}
                disabled={isSimulating}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Payload</Label>
              <Input 
                value={config.dataPayload}
                onChange={(e) => setConfig(prev => ({ ...prev, dataPayload: e.target.value }))}
                disabled={isSimulating}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <Button 
              onClick={handleStartSimulation}
              disabled={isSimulating || isLoading}
              className="flex-1"
            >
              <Play className={`h-4 w-4 mr-2 ${isSimulating ? 'animate-pulse' : ''}`} />
              {isSimulating ? 'Simulating...' : 'Start Quantum Transfer'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isSimulating}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Layer Execution Progress
            </CardTitle>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span>{getElapsedTime()}s</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{getPassedCount()}/{layerResults.length}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{layerResults.length}/20 Layers</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-3" />
            </div>

            {/* Layer Grid */}
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
              {LAYER_NAMES.map((name, idx) => {
                const result = layerResults[idx];
                const isActive = currentLayer === idx;
                const isPending = idx > currentLayer;
                
                return (
                  <div
                    key={idx}
                    className={`relative p-3 rounded-lg border transition-all duration-300 ${
                      isActive 
                        ? 'border-primary bg-primary/10 animate-pulse scale-105 shadow-lg shadow-primary/20' 
                        : result 
                          ? result.passed 
                            ? 'border-green-500/50 bg-green-500/10' 
                            : 'border-red-500/50 bg-red-500/10'
                          : isPending
                            ? 'border-border bg-muted/30 opacity-50'
                            : 'border-border bg-card'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        result?.passed ? 'text-green-500' : 
                        result ? 'text-red-500' : 
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate" title={name}>
                        {name.split('-')[0]}
                      </div>
                      {result && (
                        <div className="absolute -top-1 -right-1">
                          {result.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500 bg-background rounded-full" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 bg-background rounded-full" />
                          )}
                        </div>
                      )}
                      {isActive && !result && (
                        <Zap className="h-4 w-4 absolute -top-1 -right-1 text-primary animate-bounce" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {layerResults.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{getAverageScore().toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Security Score</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{getPassedCount()}</p>
                <p className="text-sm text-muted-foreground">Layers Passed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Timer className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{getElapsedTime()}s</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Lock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <Badge variant={simulationComplete && getPassedCount() >= 18 ? 'default' : 'destructive'}>
                  {simulationComplete && getPassedCount() >= 18 ? 'SECURE' : 'PENDING'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Transfer Status</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transfer Flow Visualization */}
      {simulationComplete && (
        <Card className="bg-gradient-to-r from-green-500/5 to-blue-500/5 border-green-500/30">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-1">From</p>
                <p className="font-mono text-xs">{config.sender.slice(0, 10)}...{config.sender.slice(-8)}</p>
              </div>
              <div className="flex items-center gap-2 px-4">
                <div className="h-0.5 w-8 bg-gradient-to-r from-primary to-green-500" />
                <div className="p-2 rounded-full bg-green-500/20">
                  <ArrowRight className="h-4 w-4 text-green-500" />
                </div>
                <div className="h-0.5 w-8 bg-gradient-to-r from-green-500 to-primary" />
              </div>
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-1">To</p>
                <p className="font-mono text-xs">{config.receiver.slice(0, 10)}...{config.receiver.slice(-8)}</p>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-2xl font-bold text-green-500">{config.amount} QU</p>
              <p className="text-sm text-muted-foreground">Quantum Units Transferred</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
