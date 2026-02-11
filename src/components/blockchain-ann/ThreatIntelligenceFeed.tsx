import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Globe, Shield, AlertTriangle, RefreshCw, Target, Eye,
  CheckCircle, ExternalLink, Filter, Layers
} from 'lucide-react';

interface ThreatIntelEntry {
  id: string;
  source: string;
  type: string;
  severity: string;
  description: string;
  indicators: string[];
  mitreAttackId?: string;
  mitreAttackName?: string;
  mitreTactic?: string;
  timestamp: string;
  confidence: number;
  tags: string[];
}

interface FirewallRule {
  ruleId: string;
  action: string;
  source: string;
  mitreId: string;
  indicators: string[];
  confidence: number;
  autoApplied: boolean;
}

interface ThreatIntelData {
  entries: ThreatIntelEntry[];
  stats: {
    tacticsBreakdown: Record<string, number>;
    severityBreakdown: Record<string, number>;
    sourceBreakdown: Record<string, number>;
  };
  firewallRules: FirewallRule[];
  metadata: {
    totalEntries: number;
    lastUpdated: string;
    sources: string[];
    mitreTechniques: number;
  };
}

export function ThreatIntelligenceFeed() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ThreatIntelData | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const fetchIntelligence = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/threat-intelligence-feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ operation: 'fetch' }),
        }
      );
      const result = await response.json();
      if (result.success) {
        setData(result);
        toast({ title: "Intelligence Updated", description: `${result.entries.length} threat entries from ${result.metadata.sources.length} sources` });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({ title: "Feed Error", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const filteredEntries = data?.entries.filter(
    e => severityFilter === 'all' || e.severity === severityFilter
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-blue-500" />
                Threat Intelligence Feed
              </CardTitle>
              <CardDescription>
                Aggregated threat data from MITRE ATT&CK, AlienVault OTX, CISA & more
              </CardDescription>
            </div>
            <Button onClick={fetchIntelligence} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Refresh Feed
            </Button>
          </div>
        </CardHeader>
        {data && (
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-primary">{data.metadata.totalEntries}</div>
                <div className="text-xs text-muted-foreground">Total Entries</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-red-500">{data.stats.severityBreakdown['critical'] || 0}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-green-500">{data.firewallRules.length}</div>
                <div className="text-xs text-muted-foreground">Rules Generated</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-blue-500">{data.metadata.sources.length}</div>
                <div className="text-xs text-muted-foreground">Intel Sources</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {data && (
        <>
          {/* MITRE ATT&CK Tactics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5" />
                MITRE ATT&CK Tactics Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.stats.tacticsBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tactic, count]) => (
                    <div key={tactic} className="flex items-center gap-3">
                      <span className="text-xs w-40 truncate">{tactic}</span>
                      <Progress value={(count / data.metadata.totalEntries) * 100} className="h-2 flex-1" />
                      <Badge variant="outline" className="text-xs">{count}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Auto-Generated Firewall Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5" />
                Auto-Generated Firewall Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data.firewallRules.map((rule) => (
                  <div key={rule.ruleId} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                    <div className="flex items-center gap-2">
                      {rule.autoApplied ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      )}
                      <Badge variant="outline">{rule.mitreId}</Badge>
                      <span className="text-muted-foreground">{rule.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{(rule.confidence * 100).toFixed(0)}%</span>
                      <Badge variant={rule.autoApplied ? 'default' : 'secondary'}>
                        {rule.autoApplied ? 'Auto-Applied' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Threat Entries */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-5 w-5" />
                  Intelligence Entries
                </CardTitle>
                <div className="flex gap-1">
                  {['all', 'critical', 'high', 'medium', 'low'].map((s) => (
                    <Button
                      key={s}
                      variant={severityFilter === s ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs px-2 h-7"
                      onClick={() => setSeverityFilter(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className={`p-3 rounded-lg border ${getSeverityColor(entry.severity)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-[10px]">{entry.severity}</Badge>
                        {entry.mitreAttackId && (
                          <Badge variant="outline" className="text-[10px]">{entry.mitreAttackId}</Badge>
                        )}
                        <span className="text-xs font-medium">{entry.mitreAttackName || entry.type}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{entry.source}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{entry.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {entry.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{tag}</span>
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        Confidence: {(entry.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!data && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Refresh Feed" to fetch the latest threat intelligence data</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
