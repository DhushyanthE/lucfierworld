import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Zap, Plus, Play, Trash2, ArrowDown, Shield, AlertTriangle,
  CheckCircle, Brain, Target, Lock, Eye, Bell, RefreshCw
} from 'lucide-react';

interface PlaybookStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'notification';
  name: string;
  config: Record<string, string>;
  icon: string;
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  steps: PlaybookStep[];
  enabled: boolean;
  executionCount: number;
  lastExecuted?: string;
}

const STEP_TEMPLATES = {
  triggers: [
    { type: 'trigger' as const, name: 'Critical Threat Detected', icon: 'alert', config: { severity: 'critical', source: 'quantum-firewall' } },
    { type: 'trigger' as const, name: 'DDoS Attack Detected', icon: 'shield', config: { threatType: 'ddos', threshold: '1000' } },
    { type: 'trigger' as const, name: 'APT Campaign Identified', icon: 'target', config: { threatType: 'apt', persistence: 'true' } },
    { type: 'trigger' as const, name: 'Anomaly Score Exceeded', icon: 'brain', config: { threshold: '0.85', metric: 'anomaly_score' } },
  ],
  conditions: [
    { type: 'condition' as const, name: 'Check Severity Level', icon: 'eye', config: { operator: '>=', value: 'high' } },
    { type: 'condition' as const, name: 'Verify Source IP', icon: 'lock', config: { action: 'geo-lookup', allowlist: 'internal' } },
    { type: 'condition' as const, name: 'Time-Based Rule', icon: 'eye', config: { window: '5m', threshold: '3' } },
  ],
  actions: [
    { type: 'action' as const, name: 'Isolate Network Segment', icon: 'lock', config: { scope: 'micro-segment', duration: '1h' } },
    { type: 'action' as const, name: 'Deploy Quantum Honeypot', icon: 'target', config: { type: 'quantum-trap', strength: '0.95' } },
    { type: 'action' as const, name: 'Activate QNN Defense', icon: 'brain', config: { mode: 'aggressive', layers: 'all' } },
    { type: 'action' as const, name: 'Block IP Range', icon: 'shield', config: { action: 'block', scope: '/24' } },
    { type: 'action' as const, name: 'Run Threat Scan', icon: 'eye', config: { depth: 'full', includeEchoes: 'true' } },
    { type: 'action' as const, name: 'Rotate Encryption Keys', icon: 'lock', config: { algorithm: 'pqc-lattice', scope: 'session' } },
  ],
  notifications: [
    { type: 'notification' as const, name: 'Email Alert', icon: 'bell', config: { channel: 'email', priority: 'high' } },
    { type: 'notification' as const, name: 'Push Notification', icon: 'bell', config: { channel: 'push', sound: 'critical' } },
    { type: 'notification' as const, name: 'In-App Alert', icon: 'bell', config: { channel: 'in-app', persistent: 'true' } },
    { type: 'notification' as const, name: 'Log to Blockchain', icon: 'lock', config: { channel: 'blockchain', immutable: 'true' } },
  ],
};

const PRESET_PLAYBOOKS: Omit<Playbook, 'id'>[] = [
  {
    name: 'Ransomware Response',
    description: 'Automated response to ransomware detection',
    triggerType: 'threat',
    steps: [
      { id: '1', type: 'trigger', name: 'Critical Threat Detected', icon: 'alert', config: { severity: 'critical', source: 'quantum-firewall' } },
      { id: '2', type: 'condition', name: 'Check Severity Level', icon: 'eye', config: { operator: '>=', value: 'critical' } },
      { id: '3', type: 'action', name: 'Isolate Network Segment', icon: 'lock', config: { scope: 'micro-segment', duration: '24h' } },
      { id: '4', type: 'action', name: 'Activate QNN Defense', icon: 'brain', config: { mode: 'aggressive', layers: 'all' } },
      { id: '5', type: 'notification', name: 'Email Alert', icon: 'bell', config: { channel: 'email', priority: 'critical' } },
    ],
    enabled: true,
    executionCount: 0,
  },
  {
    name: 'DDoS Mitigation',
    description: 'Auto-mitigate volumetric and application-layer DDoS attacks',
    triggerType: 'ddos',
    steps: [
      { id: '1', type: 'trigger', name: 'DDoS Attack Detected', icon: 'shield', config: { threatType: 'ddos', threshold: '1000' } },
      { id: '2', type: 'action', name: 'Block IP Range', icon: 'shield', config: { action: 'block', scope: '/24' } },
      { id: '3', type: 'action', name: 'Deploy Quantum Honeypot', icon: 'target', config: { type: 'quantum-trap', strength: '0.95' } },
      { id: '4', type: 'notification', name: 'Push Notification', icon: 'bell', config: { channel: 'push', sound: 'critical' } },
    ],
    enabled: true,
    executionCount: 0,
  },
  {
    name: 'APT Threat Hunt',
    description: 'Proactive APT hunting with deception technology',
    triggerType: 'apt',
    steps: [
      { id: '1', type: 'trigger', name: 'APT Campaign Identified', icon: 'target', config: { threatType: 'apt', persistence: 'true' } },
      { id: '2', type: 'action', name: 'Run Threat Scan', icon: 'eye', config: { depth: 'full', includeEchoes: 'true' } },
      { id: '3', type: 'action', name: 'Deploy Quantum Honeypot', icon: 'target', config: { type: 'quantum-trap', strength: '0.98' } },
      { id: '4', type: 'action', name: 'Rotate Encryption Keys', icon: 'lock', config: { algorithm: 'pqc-lattice', scope: 'all' } },
      { id: '5', type: 'notification', name: 'Log to Blockchain', icon: 'lock', config: { channel: 'blockchain', immutable: 'true' } },
    ],
    enabled: true,
    executionCount: 0,
  },
];

const getStepIcon = (icon: string) => {
  switch (icon) {
    case 'alert': return <AlertTriangle className="h-4 w-4" />;
    case 'shield': return <Shield className="h-4 w-4" />;
    case 'target': return <Target className="h-4 w-4" />;
    case 'brain': return <Brain className="h-4 w-4" />;
    case 'lock': return <Lock className="h-4 w-4" />;
    case 'eye': return <Eye className="h-4 w-4" />;
    case 'bell': return <Bell className="h-4 w-4" />;
    default: return <Zap className="h-4 w-4" />;
  }
};

const getStepColor = (type: string) => {
  switch (type) {
    case 'trigger': return 'border-red-500/30 bg-red-500/5';
    case 'condition': return 'border-yellow-500/30 bg-yellow-500/5';
    case 'action': return 'border-blue-500/30 bg-blue-500/5';
    case 'notification': return 'border-green-500/30 bg-green-500/5';
    default: return 'border-muted';
  }
};

export function SOARPlaybookBuilder() {
  const { toast } = useToast();
  const [playbooks, setPlaybooks] = useState<Playbook[]>(
    PRESET_PLAYBOOKS.map((p, i) => ({ ...p, id: `pb-${i}` }))
  );
  const [selectedPlaybook, setSelectedPlaybook] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [addingCategory, setAddingCategory] = useState<string | null>(null);

  const activePlaybook = playbooks.find(p => p.id === selectedPlaybook);

  const addStepToPlaybook = (template: typeof STEP_TEMPLATES.actions[0]) => {
    if (!selectedPlaybook) return;
    setPlaybooks(prev => prev.map(pb => {
      if (pb.id !== selectedPlaybook) return pb;
      return {
        ...pb,
        steps: [...pb.steps, { ...template, id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }],
      };
    }));
    setAddingCategory(null);
  };

  const removeStep = (stepId: string) => {
    if (!selectedPlaybook) return;
    setPlaybooks(prev => prev.map(pb => {
      if (pb.id !== selectedPlaybook) return pb;
      return { ...pb, steps: pb.steps.filter(s => s.id !== stepId) };
    }));
  };

  const togglePlaybook = (pbId: string) => {
    setPlaybooks(prev => prev.map(pb => {
      if (pb.id !== pbId) return pb;
      return { ...pb, enabled: !pb.enabled };
    }));
  };

  const simulatePlaybook = async () => {
    if (!activePlaybook) return;
    setIsSimulating(true);
    
    // Simulate step-by-step execution
    for (let i = 0; i < activePlaybook.steps.length; i++) {
      await new Promise(r => setTimeout(r, 800));
    }
    
    setPlaybooks(prev => prev.map(pb => {
      if (pb.id !== selectedPlaybook) return pb;
      return { ...pb, executionCount: pb.executionCount + 1, lastExecuted: new Date().toISOString() };
    }));

    setIsSimulating(false);
    toast({ title: "Playbook Simulated", description: `${activePlaybook.name} executed ${activePlaybook.steps.length} steps successfully` });
  };

  const createNewPlaybook = () => {
    const newPb: Playbook = {
      id: `pb-${Date.now()}`,
      name: 'New Playbook',
      description: 'Custom automated response workflow',
      triggerType: 'custom',
      steps: [],
      enabled: false,
      executionCount: 0,
    };
    setPlaybooks(prev => [...prev, newPb]);
    setSelectedPlaybook(newPb.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-red-600/5 to-orange-600/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-orange-500" />
                SOAR Playbook Builder
              </CardTitle>
              <CardDescription>
                Define automated response workflows for threat types
              </CardDescription>
            </div>
            <Button onClick={createNewPlaybook} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              New Playbook
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Playbook List */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Playbooks</h3>
          {playbooks.map((pb) => (
            <Card
              key={pb.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                selectedPlaybook === pb.id ? 'border-primary ring-1 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedPlaybook(pb.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{pb.name}</span>
                  <Badge variant={pb.enabled ? 'default' : 'secondary'} className="text-[10px]">
                    {pb.enabled ? 'Active' : 'Disabled'}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{pb.description}</p>
                <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>{pb.steps.length} steps</span>
                  <span>{pb.executionCount} runs</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Playbook Editor */}
        <div className="col-span-2 space-y-4">
          {activePlaybook ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{activePlaybook.name}</h3>
                  <p className="text-xs text-muted-foreground">{activePlaybook.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePlaybook(activePlaybook.id)}
                  >
                    {activePlaybook.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={simulatePlaybook}
                    disabled={isSimulating || activePlaybook.steps.length === 0}
                  >
                    {isSimulating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    Simulate
                  </Button>
                </div>
              </div>

              {/* Visual Workflow */}
              <div className="space-y-1">
                {activePlaybook.steps.map((step, idx) => (
                  <div key={step.id}>
                    <div className={`p-3 rounded-lg border ${getStepColor(step.type)} flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className={`p-1.5 rounded ${
                          step.type === 'trigger' ? 'text-red-500' :
                          step.type === 'condition' ? 'text-yellow-500' :
                          step.type === 'action' ? 'text-blue-500' : 'text-green-500'
                        }`}>
                          {getStepIcon(step.icon)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{step.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {Object.entries(step.config).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px]">{step.type}</Badge>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeStep(step.id)}>
                          <Trash2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    {idx < activePlaybook.steps.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ArrowDown className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Step */}
              <Card className="border-dashed">
                <CardContent className="p-3">
                  <div className="flex gap-2 mb-2">
                    {['triggers', 'conditions', 'actions', 'notifications'].map((cat) => (
                      <Button
                        key={cat}
                        variant={addingCategory === cat ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs"
                        onClick={() => setAddingCategory(addingCategory === cat ? null : cat)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {cat}
                      </Button>
                    ))}
                  </div>
                  {addingCategory && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {(STEP_TEMPLATES[addingCategory as keyof typeof STEP_TEMPLATES] || []).map((tmpl, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="justify-start text-xs h-auto py-2"
                          onClick={() => addStepToPlaybook(tmpl)}
                        >
                          {getStepIcon(tmpl.icon)}
                          <span className="ml-2">{tmpl.name}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a playbook to edit or create a new one</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
