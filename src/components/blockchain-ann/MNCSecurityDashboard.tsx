import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  Lock,
  Network,
  Brain,
  Layers,
  AlertTriangle,
  CheckCircle,
  Activity,
  Eye,
  Target,
  Zap,
  RefreshCw,
  FileText,
  Server,
  Globe,
  Key,
  ShieldCheck,
  AlertOctagon,
} from 'lucide-react';

interface SecurityLayer {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'learning';
  effectiveness: number;
  threatsBlocked: number;
  icon: React.ReactNode;
}

interface ThreatPatternAnalysis {
  patterns: Array<{
    type: string;
    severity: string;
    count: number;
    avgFidelity: number;
    successRate: number;
  }>;
  insights: string[];
  recommendations: string[];
  riskScore: number;
  confidenceLevel: number;
}

// MNC-style security layers based on real-world practices
const MNC_SECURITY_LAYERS: SecurityLayer[] = [
  { id: 'waf', name: 'Web Application Firewall', type: 'edge', status: 'active', effectiveness: 0.95, threatsBlocked: 0, icon: <Globe className="h-4 w-4" /> },
  { id: 'ddos', name: 'DDoS Protection', type: 'edge', status: 'active', effectiveness: 0.98, threatsBlocked: 0, icon: <Shield className="h-4 w-4" /> },
  { id: 'zero-trust', name: 'Zero Trust Access', type: 'access', status: 'active', effectiveness: 0.92, threatsBlocked: 0, icon: <Key className="h-4 w-4" /> },
  { id: 'micro-seg', name: 'Micro-Segmentation', type: 'network', status: 'active', effectiveness: 0.89, threatsBlocked: 0, icon: <Layers className="h-4 w-4" /> },
  { id: 'ai-soc', name: 'AI-Driven SOC', type: 'detection', status: 'learning', effectiveness: 0.94, threatsBlocked: 0, icon: <Brain className="h-4 w-4" /> },
  { id: 'deception', name: 'Deception Technology', type: 'active', status: 'active', effectiveness: 0.87, threatsBlocked: 0, icon: <Target className="h-4 w-4" /> },
  { id: 'soar', name: 'SOAR Automation', type: 'response', status: 'active', effectiveness: 0.91, threatsBlocked: 0, icon: <Zap className="h-4 w-4" /> },
  { id: 'edr', name: 'Endpoint Detection', type: 'endpoint', status: 'active', effectiveness: 0.93, threatsBlocked: 0, icon: <Server className="h-4 w-4" /> },
  { id: 'pqc', name: 'Post-Quantum Crypto', type: 'crypto', status: 'active', effectiveness: 0.99, threatsBlocked: 0, icon: <Lock className="h-4 w-4" /> },
  { id: 'compliance', name: 'Compliance Engine', type: 'audit', status: 'active', effectiveness: 1.0, threatsBlocked: 0, icon: <FileText className="h-4 w-4" /> },
];

export function MNCSecurityDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [securityLayers, setSecurityLayers] = useState<SecurityLayer[]>(MNC_SECURITY_LAYERS);
  const [patternAnalysis, setPatternAnalysis] = useState<ThreatPatternAnalysis | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1d' | '7d' | '30d'>('7d');
  const [overallSecurityScore, setOverallSecurityScore] = useState(0);

  useEffect(() => {
    // Calculate overall security score
    const avgEffectiveness = securityLayers.reduce((sum, l) => sum + l.effectiveness, 0) / securityLayers.length;
    const activeCount = securityLayers.filter(l => l.status === 'active').length;
    const activeRatio = activeCount / securityLayers.length;
    setOverallSecurityScore(avgEffectiveness * activeRatio * 100);
  }, [securityLayers]);

  const runPatternLearning = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/threat-pattern-learning`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            operation: 'analyze',
            timeRange: selectedTimeRange,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setPatternAnalysis(data.result);
        toast({
          title: "Pattern Analysis Complete",
          description: `Analyzed ${data.meta.logsAnalyzed} logs over ${selectedTimeRange}`,
        });
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Pattern learning error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLayerStatus = (layerId: string) => {
    setSecurityLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newStatus = layer.status === 'active' ? 'inactive' : 'active';
        return { ...layer, status: newStatus };
      }
      return layer;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-red-500';
      case 'learning': return 'bg-blue-500 animate-pulse';
      default: return 'bg-muted';
    }
  };

  const getLayerTypeColor = (type: string) => {
    switch (type) {
      case 'edge': return 'text-purple-400 bg-purple-500/10';
      case 'access': return 'text-blue-400 bg-blue-500/10';
      case 'network': return 'text-green-400 bg-green-500/10';
      case 'detection': return 'text-yellow-400 bg-yellow-500/10';
      case 'active': return 'text-orange-400 bg-orange-500/10';
      case 'response': return 'text-red-400 bg-red-500/10';
      case 'endpoint': return 'text-cyan-400 bg-cyan-500/10';
      case 'crypto': return 'text-pink-400 bg-pink-500/10';
      case 'audit': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-600/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                MNC-Grade Security Dashboard
              </CardTitle>
              <CardDescription>
                Defense-in-depth architecture following Google, Microsoft, AWS best practices
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {overallSecurityScore.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Security Posture</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Defense Effectiveness</span>
              <span>{overallSecurityScore.toFixed(1)}%</span>
            </div>
            <Progress value={overallSecurityScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Security Architecture Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Defense-in-Depth Architecture
          </CardTitle>
          <CardDescription>
            Multi-layered security stack following MNC best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Architecture Flow */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4 flex-wrap">
              <span>Internet</span>
              <span>→</span>
              <Badge variant="outline">Edge Security</Badge>
              <span>→</span>
              <Badge variant="outline">Zero Trust</Badge>
              <span>→</span>
              <Badge variant="outline">Network Segmentation</Badge>
              <span>→</span>
              <Badge variant="outline">AI SOC</Badge>
              <span>→</span>
              <Badge variant="outline">SOAR</Badge>
            </div>

            {/* Layer Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {securityLayers.map((layer) => (
                <div
                  key={layer.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/50 ${
                    layer.status === 'active' ? 'border-green-500/30 bg-green-500/5' :
                    layer.status === 'learning' ? 'border-blue-500/30 bg-blue-500/5' :
                    'border-muted bg-muted/20 opacity-60'
                  }`}
                  onClick={() => toggleLayerStatus(layer.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded ${getLayerTypeColor(layer.type)}`}>
                      {layer.icon}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(layer.status)}`} />
                  </div>
                  <div className="text-xs font-medium truncate">{layer.name}</div>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-[10px] px-1">
                      {layer.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {(layer.effectiveness * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threat Pattern Learning */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Threat Pattern Learning
              </CardTitle>
              <CardDescription>
                ML-based threat pattern analysis using historical data
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="bg-background border rounded px-2 py-1 text-sm"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <Button onClick={runPatternLearning} disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                Analyze Patterns
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {patternAnalysis ? (
            <div className="space-y-4">
              {/* Risk Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className={`text-2xl font-bold ${
                    patternAnalysis.riskScore > 70 ? 'text-red-500' :
                    patternAnalysis.riskScore > 40 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {patternAnalysis.riskScore.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Risk Score</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {patternAnalysis.patterns.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Threat Types</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {(patternAnalysis.confidenceLevel * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Confidence</div>
                </div>
              </div>

              {/* Insights */}
              {patternAnalysis.insights.length > 0 && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    AI Insights
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {patternAnalysis.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 mt-1 text-blue-500 shrink-0" />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {patternAnalysis.recommendations.length > 0 && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Recommendations
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {patternAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Zap className="h-3 w-3 mt-1 text-yellow-500 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Top Threat Patterns */}
              {patternAnalysis.patterns.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Top Threat Patterns</div>
                  <div className="space-y-2">
                    {patternAnalysis.patterns.slice(0, 5).map((pattern, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            pattern.severity === 'critical' ? 'destructive' :
                            pattern.severity === 'high' ? 'default' : 'secondary'
                          }>
                            {pattern.severity}
                          </Badge>
                          <span className="text-sm font-medium">{pattern.type}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{pattern.count} occurrences</span>
                          <span className={pattern.successRate >= 0.8 ? 'text-green-500' : 'text-yellow-500'}>
                            {(pattern.successRate * 100).toFixed(0)}% blocked
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Run pattern analysis to see AI-powered threat insights</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Compliance & Audit Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { name: 'ISO 27001', status: 'compliant' },
              { name: 'SOC 2', status: 'compliant' },
              { name: 'GDPR', status: 'compliant' },
              { name: 'HIPAA', status: 'partial' },
              { name: 'NIST', status: 'compliant' },
              { name: 'PCI DSS', status: 'compliant' },
            ].map((compliance) => (
              <div
                key={compliance.name}
                className={`p-3 rounded-lg text-center border ${
                  compliance.status === 'compliant' 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : 'border-yellow-500/30 bg-yellow-500/5'
                }`}
              >
                <div className="text-xs font-medium">{compliance.name}</div>
                <Badge
                  variant={compliance.status === 'compliant' ? 'default' : 'secondary'}
                  className="mt-1 text-[10px]"
                >
                  {compliance.status === 'compliant' ? (
                    <><CheckCircle className="h-3 w-3 mr-1" />Compliant</>
                  ) : (
                    <><AlertTriangle className="h-3 w-3 mr-1" />Partial</>
                  )}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
