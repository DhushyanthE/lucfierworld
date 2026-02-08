import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuantumFirewall } from '@/hooks/useQuantumFirewall';
import { QuantumLayerProgressIndicator } from './QuantumLayerProgressIndicator';
import { 
  Shield, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Network,
  Brain,
  Lock,
  Target,
  Layers,
  RefreshCw,
  Eye,
  Bug,
  Skull,
  AlertOctagon,
  ShieldCheck,
  Radio
} from 'lucide-react';

export function QuantumFirewallDashboard() {
  const {
    isLoading,
    error,
    subspaces,
    honeypots,
    qnnLayers,
    threats,
    metrics,
    lastCycleResult,
    initializeFirewall,
    scanForThreats,
    activateHoneypots,
    runQNNDefense,
    runFullDefenseCycle,
  } = useQuantumFirewall();

  const [isInitialized, setIsInitialized] = useState(false);
  const [firewallMode, setFirewallMode] = useState<'passive' | 'active' | 'aggressive'>('active');

  const handleInitialize = async () => {
    try {
      await initializeFirewall(firewallMode);
      setIsInitialized(true);
    } catch (err) {
      console.error('Failed to initialize firewall:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'malware': return <Bug className="h-4 w-4" />;
      case 'ransomware': return <Skull className="h-4 w-4" />;
      case 'ddos': return <Radio className="h-4 w-4" />;
      case 'apt': return <AlertOctagon className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Quantum-Firewall Defense System
              <Badge variant={isInitialized ? 'default' : 'secondary'} className="ml-2">
                {isInitialized ? 'ACTIVE' : 'OFFLINE'}
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <select
                value={firewallMode}
                onChange={(e) => setFirewallMode(e.target.value as any)}
                className="bg-background border rounded px-3 py-1 text-sm"
              >
                <option value="passive">Passive Mode</option>
                <option value="active">Active Mode</option>
                <option value="aggressive">Aggressive Mode</option>
              </select>
              <Button onClick={handleInitialize} disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {isInitialized ? 'Reinitialize' : 'Initialize'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Quick Metrics */}
          {metrics && (
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-2xl font-bold text-primary">{metrics.threatsDetected}</div>
                  <div className="text-xs text-muted-foreground">Threats Detected</div>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-2xl font-bold text-green-500">{metrics.threatsNeutralized}</div>
                  <div className="text-xs text-muted-foreground">Neutralized</div>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-2xl font-bold text-blue-500">{(metrics.defenseScore * 100).toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Defense Score</div>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-2xl font-bold text-purple-500">{(metrics.quantumFidelity * 100).toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">Quantum Fidelity</div>
                </div>
                <div className="p-3 rounded-lg bg-muted text-center">
                  <div className="text-2xl font-bold text-orange-500">{(metrics.subspaceEfficiency * 100).toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Subspace Efficiency</div>
                </div>
              </div>
              
              {/* Quantum Echoes 20-Layer Security Status */}
              {metrics.layersPassed !== undefined && (
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      20-Layer Quantum Echoes Security
                    </span>
                    <Badge variant={metrics.layersPassed >= 18 ? 'default' : 'destructive'}>
                      {metrics.layersPassed}/{metrics.totalLayers || 20} Layers Passed
                    </Badge>
                  </div>
                  <Progress value={(metrics.layersPassed / (metrics.totalLayers || 20)) * 100} className="h-2" />
                  {metrics.echoResonance !== undefined && (
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>Echo Resonance: {(metrics.echoResonance * 100).toFixed(2)}%</span>
                      <span>Pass Rate: {((metrics.layersPassed / (metrics.totalLayers || 20)) * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={scanForThreats} disabled={isLoading || !isInitialized} variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Threat Scan
        </Button>
        <Button onClick={activateHoneypots} disabled={isLoading || !isInitialized} variant="outline">
          <Target className="h-4 w-4 mr-2" />
          Activate Honeypots
        </Button>
        <Button onClick={() => runQNNDefense()} disabled={isLoading || !isInitialized} variant="outline">
          <Brain className="h-4 w-4 mr-2" />
          QNN Defense
        </Button>
        <Button 
          onClick={runFullDefenseCycle} 
          disabled={isLoading || !isInitialized}
          className="bg-gradient-to-r from-primary to-purple-600"
        >
          <ShieldCheck className="h-4 w-4 mr-2" />
          Full Defense Cycle
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="subspaces" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="subspaces">
            <Layers className="h-4 w-4 mr-2" />
            Subspaces
          </TabsTrigger>
          <TabsTrigger value="honeypots">
            <Target className="h-4 w-4 mr-2" />
            Honeypots
          </TabsTrigger>
          <TabsTrigger value="qnn">
            <Brain className="h-4 w-4 mr-2" />
            QNN Layers
          </TabsTrigger>
          <TabsTrigger value="threats">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Threats
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Lock className="h-4 w-4 mr-2" />
            Blockchain Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subspaces" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {subspaces.map((subspace) => (
              <Card key={subspace.id} className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="truncate">{subspace.id}</span>
                    <Badge variant={subspace.active ? 'default' : 'secondary'}>
                      {subspace.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Dimension:</span>
                      <span className="ml-1 font-mono">{subspace.dimension}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Qubits:</span>
                      <span className="ml-1 font-mono">{subspace.qubits}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Compression:</span>
                      <span className="ml-1 font-mono">{subspace.compressionRatio.toFixed(2)}x</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Security:</span>
                      <Badge variant="outline" className="ml-1 text-xs">
                        {subspace.securityLevel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="honeypots" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {honeypots.map((honeypot) => (
              <Card key={honeypot.id} className={`border-2 ${
                honeypot.status === 'triggered' ? 'border-yellow-500' : 
                honeypot.status === 'analyzing' ? 'border-blue-500' : 'border-green-500/50'
              }`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className={`h-4 w-4 ${
                        honeypot.type === 'quantum-trap' ? 'text-purple-500' : 'text-orange-500'
                      }`} />
                      {honeypot.id}
                    </div>
                    <Badge variant={
                      honeypot.status === 'triggered' ? 'destructive' : 
                      honeypot.status === 'analyzing' ? 'secondary' : 'default'
                    }>
                      {honeypot.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Attractor Strength</span>
                    <span className="font-mono">{(honeypot.attractorStrength * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={honeypot.attractorStrength * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Quantum Entanglement</span>
                    <span className="font-mono">{(honeypot.quantumEntanglement * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={honeypot.quantumEntanglement * 100} className="h-2 bg-purple-500/20" />
                  
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-muted-foreground">Captured Threats</span>
                    <Badge variant="outline">{honeypot.capturedThreats}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="qnn" className="space-y-4">
          <div className="space-y-3">
            {qnnLayers.map((layer, idx) => (
              <Card key={layer.id} className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{layer.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {layer.neurons} neurons • {layer.activationFunction}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Entanglement</div>
                        <div className="font-mono text-sm">{layer.entanglementDepth}</div>
                      </div>
                      <div className="flex gap-1">
                        {layer.quantumGates.slice(0, 4).map((gate, i) => (
                          <Badge key={i} variant="outline" className="text-xs px-1">
                            {gate}
                          </Badge>
                        ))}
                        {layer.quantumGates.length > 4 && (
                          <Badge variant="secondary" className="text-xs px-1">
                            +{layer.quantumGates.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          {threats.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No active threats detected. Run a threat scan to analyze.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {threats.map((threat) => (
                <Card key={threat.id} className={`border-l-4 ${
                  threat.neutralized ? 'border-l-green-500 opacity-60' : 
                  threat.severity === 'critical' ? 'border-l-red-500' :
                  threat.severity === 'high' ? 'border-l-orange-500' : 'border-l-yellow-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getSeverityColor(threat.severity)}`}>
                          {getThreatIcon(threat.type)}
                        </div>
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {threat.type.toUpperCase()}
                            <Badge className={getSeverityColor(threat.severity)}>
                              {threat.severity}
                            </Badge>
                            {threat.neutralized && (
                              <Badge variant="outline" className="text-green-500 border-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Neutralized
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {threat.signature.slice(0, 32)}...
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        {new Date(threat.detectedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          {lastCycleResult?.cycle?.auditEntry ? (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Blockchain Audit Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground mb-1">Block Hash</div>
                    <div className="font-mono text-xs break-all">{lastCycleResult.cycle.auditEntry.blockHash}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground mb-1">Previous Hash</div>
                    <div className="font-mono text-xs break-all">{lastCycleResult.cycle.auditEntry.previousHash}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <div className="text-xs text-muted-foreground mb-1">Merkle Root</div>
                    <div className="font-mono text-xs break-all">{lastCycleResult.cycle.auditEntry.merkleRoot}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground mb-1">Nonce</div>
                      <div className="font-mono text-sm">{lastCycleResult.cycle.auditEntry.nonce}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground mb-1">Timestamp</div>
                      <div className="font-mono text-sm">
                        {new Date(lastCycleResult.cycle.auditEntry.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Defense Actions */}
                {lastCycleResult.cycle.defense && (
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Defense Actions Logged</div>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {lastCycleResult.cycle.defense.defenseActions.map((action, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted text-xs">
                          <div className="flex items-center gap-2">
                            {action.success ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            )}
                            <span className="font-mono">{action.threatId.slice(0, 12)}</span>
                          </div>
                          <Badge variant="outline">{action.action}</Badge>
                          <span className="text-muted-foreground">{action.layer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No blockchain audit entries yet. Run a full defense cycle to generate.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
