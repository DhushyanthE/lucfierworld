import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Magnet, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Zap,
  Shield,
  Eye,
  Bug,
  Skull,
  Radio
} from 'lucide-react';

interface CapturedThreat {
  id: string;
  type: string;
  severity: string;
  capturedBy: string;
  capturedAt: string;
  analysisComplete: boolean;
}

interface AttractorMetrics {
  totalAttractions: number;
  successfulCaptures: number;
  quantumDeception: number;
  activeHoneypots: number;
  threatsCaptured: CapturedThreat[];
}

interface ReverseAttractorPanelProps {
  onActivate?: () => void;
  metrics?: AttractorMetrics;
  isLoading?: boolean;
}

export function ReverseAttractorPanel({ 
  onActivate, 
  metrics,
  isLoading = false 
}: ReverseAttractorPanelProps) {
  const [simulatedMetrics, setSimulatedMetrics] = useState<AttractorMetrics>({
    totalAttractions: 0,
    successfulCaptures: 0,
    quantumDeception: 0,
    activeHoneypots: 4,
    threatsCaptured: [],
  });

  const [isActive, setIsActive] = useState(false);
  const [attractorPulse, setAttractorPulse] = useState(0);

  // Simulate active attractor animation
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setAttractorPulse(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleActivate = () => {
    setIsActive(true);
    if (onActivate) {
      onActivate();
    }
    
    // Simulate threat capture after activation
    setTimeout(() => {
      setSimulatedMetrics(prev => ({
        ...prev,
        totalAttractions: prev.totalAttractions + Math.floor(Math.random() * 10) + 5,
        successfulCaptures: prev.successfulCaptures + Math.floor(Math.random() * 5) + 1,
        quantumDeception: 0.75 + Math.random() * 0.2,
        threatsCaptured: [
          ...prev.threatsCaptured,
          {
            id: `threat-${crypto.randomUUID().slice(0, 8)}`,
            type: ['malware', 'ddos', 'apt', 'phishing'][Math.floor(Math.random() * 4)],
            severity: ['high', 'critical', 'medium'][Math.floor(Math.random() * 3)],
            capturedBy: `honeypot-quantum-trap-${Math.floor(Math.random() * 2) + 1}`,
            capturedAt: new Date().toISOString(),
            analysisComplete: false,
          }
        ].slice(-5), // Keep last 5
      }));
    }, 2000);
  };

  const displayMetrics = metrics || simulatedMetrics;

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'malware': return <Bug className="h-3 w-3" />;
      case 'ransomware': return <Skull className="h-3 w-3" />;
      case 'ddos': return <Radio className="h-3 w-3" />;
      default: return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-green-500 bg-green-500/10';
    }
  };

  return (
    <Card className="border-primary/20 overflow-hidden relative">
      {/* Animated Background */}
      {isActive && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + Math.sin(attractorPulse * 0.1) * 20}% ${50 + Math.cos(attractorPulse * 0.1) * 20}%, rgba(var(--primary), 0.1) 0%, transparent 50%)`,
          }}
        />
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Magnet className={`h-5 w-5 ${isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            Reverse Malware Attractor
            {isActive && (
              <Badge className="bg-green-500/20 text-green-500 border-green-500">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                ACTIVE
              </Badge>
            )}
          </div>
          <Button 
            onClick={handleActivate} 
            disabled={isLoading}
            size="sm"
            className={isActive ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <Target className="h-4 w-4 mr-2" />
            {isActive ? 'Attracting...' : 'Activate'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {/* Attractor Visualization */}
        <div className="relative h-48 bg-gradient-to-b from-muted/50 to-transparent rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Central Attractor */}
            <div className={`relative ${isActive ? 'animate-pulse' : ''}`}>
              <div className={`w-20 h-20 rounded-full border-4 ${
                isActive ? 'border-primary bg-primary/20' : 'border-muted-foreground/30 bg-muted'
              } flex items-center justify-center`}>
                <Magnet className={`h-8 w-8 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              
              {/* Attraction Rings */}
              {isActive && [1, 2, 3].map((ring) => (
                <div
                  key={ring}
                  className="absolute inset-0 rounded-full border border-primary/30"
                  style={{
                    transform: `scale(${1 + ring * 0.5 + (attractorPulse % 30) / 30 * 0.3})`,
                    opacity: 1 - ring * 0.25,
                  }}
                />
              ))}
            </div>

            {/* Honeypot Nodes */}
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  isActive ? 'border-green-500 bg-green-500/20' : 'border-muted-foreground/30 bg-muted'
                }`}
                style={{
                  top: `${50 + Math.sin(i * Math.PI / 2) * 35}%`,
                  left: `${50 + Math.cos(i * Math.PI / 2) * 35}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Target className={`h-4 w-4 ${isActive ? 'text-green-500' : 'text-muted-foreground'}`} />
              </div>
            ))}

            {/* Simulated Captured Threats */}
            {isActive && displayMetrics.threatsCaptured.slice(-3).map((threat, i) => (
              <div
                key={threat.id}
                className="absolute text-red-500"
                style={{
                  top: `${20 + i * 20}%`,
                  left: `${70 + (Math.random() * 20 - 10)}%`,
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              >
                <Bug className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="text-xl font-bold text-primary">{displayMetrics.totalAttractions}</div>
            <div className="text-xs text-muted-foreground">Attractions</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="text-xl font-bold text-green-500">{displayMetrics.successfulCaptures}</div>
            <div className="text-xs text-muted-foreground">Captures</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="text-xl font-bold text-blue-500">
              {(displayMetrics.quantumDeception * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-muted-foreground">Deception Rate</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="text-xl font-bold text-purple-500">{displayMetrics.activeHoneypots}</div>
            <div className="text-xs text-muted-foreground">Honeypots</div>
          </div>
        </div>

        {/* Captured Threats List */}
        {displayMetrics.threatsCaptured.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Recently Captured Threats
            </div>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {displayMetrics.threatsCaptured.slice().reverse().map((threat) => (
                <div 
                  key={threat.id} 
                  className="flex items-center justify-between p-2 rounded-lg bg-muted text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${getSeverityColor(threat.severity)}`}>
                      {getThreatIcon(threat.type)}
                    </div>
                    <div>
                      <div className="font-medium">{threat.type.toUpperCase()}</div>
                      <div className="text-muted-foreground">{threat.capturedBy}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(threat.severity)} variant="outline">
                      {threat.severity}
                    </Badge>
                    {threat.analysisComplete ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-blue-500 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attractor Strength */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Attractor Field Strength</span>
            <span className="font-mono">{isActive ? '95%' : '0%'}</span>
          </div>
          <Progress value={isActive ? 95 : 0} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
