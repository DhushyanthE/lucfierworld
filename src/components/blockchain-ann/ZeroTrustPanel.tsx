import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, Key, User, Monitor, Globe, Lock, CheckCircle,
  AlertTriangle, RefreshCw, Fingerprint, Wifi, Eye
} from 'lucide-react';

interface VerificationRequest {
  id: string;
  timestamp: string;
  identity: {
    userId: string;
    role: string;
    mfaVerified: boolean;
    riskScore: number;
  };
  device: {
    type: string;
    os: string;
    trusted: boolean;
    complianceStatus: string;
    encryptionEnabled: boolean;
  };
  context: {
    ipAddress: string;
    geoLocation: string;
    networkType: string;
    requestedResource: string;
    timeOfDay: string;
    behaviorScore: number;
  };
  decision: 'allow' | 'deny' | 'challenge' | 'pending';
  policyMatched: string;
}

interface ZeroTrustPolicy {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  conditions: string[];
  action: string;
  priority: number;
}

const DEFAULT_POLICIES: ZeroTrustPolicy[] = [
  { id: 'zt-1', name: 'MFA Required for Admin', type: 'identity', enabled: true, conditions: ['role=admin', 'mfa=required'], action: 'challenge', priority: 1 },
  { id: 'zt-2', name: 'Block Untrusted Devices', type: 'device', enabled: true, conditions: ['trusted=false', 'compliance=fail'], action: 'deny', priority: 2 },
  { id: 'zt-3', name: 'Geo-Fence Restriction', type: 'context', enabled: true, conditions: ['geo!=allowed_countries', 'risk>0.7'], action: 'deny', priority: 3 },
  { id: 'zt-4', name: 'Off-Hours Access Review', type: 'context', enabled: true, conditions: ['time=off-hours', 'resource=sensitive'], action: 'challenge', priority: 4 },
  { id: 'zt-5', name: 'Anomalous Behavior Block', type: 'behavior', enabled: true, conditions: ['behavior_score<0.3', 'session_anomaly=true'], action: 'deny', priority: 5 },
  { id: 'zt-6', name: 'Unencrypted Device Block', type: 'device', enabled: true, conditions: ['encryption=disabled'], action: 'deny', priority: 6 },
  { id: 'zt-7', name: 'Quantum Channel Required', type: 'network', enabled: true, conditions: ['network!=quantum-secured', 'resource=critical'], action: 'challenge', priority: 7 },
];

function generateVerificationRequests(): VerificationRequest[] {
  const roles = ['admin', 'user', 'analyst', 'operator'];
  const devices = ['Desktop', 'Mobile', 'Tablet', 'IoT Sensor'];
  const oses = ['Windows 11', 'macOS 14', 'Linux', 'Android 14', 'iOS 17'];
  const networks = ['Corporate VPN', 'Quantum-Secured', 'Public WiFi', 'Mobile 5G'];
  const locations = ['US-East', 'EU-West', 'AP-South', 'US-West', 'Unknown'];
  const resources = ['/api/firewall', '/api/admin', '/dashboard', '/api/transfer', '/api/keys'];
  const decisions: VerificationRequest['decision'][] = ['allow', 'deny', 'challenge', 'allow', 'allow'];
  const policies = ['MFA Required', 'Geo-Fence', 'Device Trust', 'Behavior Check', 'Time-Based'];

  return Array.from({ length: 12 }, (_, i) => {
    const riskScore = Math.random();
    const behaviorScore = Math.random();
    const decision = riskScore > 0.7 ? 'deny' : riskScore > 0.5 ? 'challenge' : 'allow';
    
    return {
      id: `vr-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      identity: {
        userId: `user-${Math.random().toString(36).slice(2, 8)}`,
        role: roles[Math.floor(Math.random() * roles.length)],
        mfaVerified: Math.random() > 0.3,
        riskScore,
      },
      device: {
        type: devices[Math.floor(Math.random() * devices.length)],
        os: oses[Math.floor(Math.random() * oses.length)],
        trusted: Math.random() > 0.25,
        complianceStatus: Math.random() > 0.2 ? 'compliant' : 'non-compliant',
        encryptionEnabled: Math.random() > 0.15,
      },
      context: {
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        geoLocation: locations[Math.floor(Math.random() * locations.length)],
        networkType: networks[Math.floor(Math.random() * networks.length)],
        requestedResource: resources[Math.floor(Math.random() * resources.length)],
        timeOfDay: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        behaviorScore,
      },
      decision: decision as VerificationRequest['decision'],
      policyMatched: policies[Math.floor(Math.random() * policies.length)],
    };
  });
}

export function ZeroTrustPanel() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<ZeroTrustPolicy[]>(DEFAULT_POLICIES);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const runVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const newRequests = generateVerificationRequests();
      setRequests(newRequests);
      setIsVerifying(false);
      const denied = newRequests.filter(r => r.decision === 'deny').length;
      const challenged = newRequests.filter(r => r.decision === 'challenge').length;
      toast({
        title: "Zero Trust Verification Complete",
        description: `${newRequests.length} requests: ${denied} denied, ${challenged} challenged`,
      });
    }, 1500);
  };

  const togglePolicy = (policyId: string) => {
    setPolicies(prev => prev.map(p =>
      p.id === policyId ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const stats = {
    total: requests.length,
    allowed: requests.filter(r => r.decision === 'allow').length,
    denied: requests.filter(r => r.decision === 'deny').length,
    challenged: requests.filter(r => r.decision === 'challenge').length,
    trustScore: requests.length > 0
      ? (requests.filter(r => r.decision === 'allow').length / requests.length) * 100
      : 100,
  };

  const getDecisionColor = (d: string) => {
    switch (d) {
      case 'allow': return 'text-green-500 bg-green-500/10';
      case 'deny': return 'text-red-500 bg-red-500/10';
      case 'challenge': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-green-600/5 to-teal-600/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-6 w-6 text-green-500" />
                Zero Trust Network Verification
              </CardTitle>
              <CardDescription>
                Never trust, always verify — identity, device & context validation
              </CardDescription>
            </div>
            <Button onClick={runVerification} disabled={isVerifying}>
              {isVerifying ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              Run Verification
            </Button>
          </div>
        </CardHeader>
        {requests.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Requests</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-green-500">{stats.allowed}</div>
                <div className="text-xs text-muted-foreground">Allowed</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-red-500">{stats.denied}</div>
                <div className="text-xs text-muted-foreground">Denied</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-yellow-500">{stats.challenged}</div>
                <div className="text-xs text-muted-foreground">Challenged</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold text-primary">{stats.trustScore.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Trust Score</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-6">
        {/* Policies */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Active Policies
          </h3>
          {policies.map((policy) => (
            <Card
              key={policy.id}
              className={`cursor-pointer transition-all ${policy.enabled ? 'border-green-500/30' : 'opacity-50'}`}
              onClick={() => togglePolicy(policy.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{policy.name}</span>
                  <Badge variant={policy.enabled ? 'default' : 'secondary'} className="text-[10px]">
                    {policy.enabled ? 'ON' : 'OFF'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {policy.conditions.map((c, i) => (
                    <span key={i} className="text-[10px] px-1 py-0.5 rounded bg-muted font-mono">{c}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="outline" className="text-[10px]">{policy.type}</Badge>
                  <Badge variant={policy.action === 'deny' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {policy.action}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Verification Requests */}
        <div className="col-span-2 space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Verification Requests
          </h3>
          {requests.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Fingerprint className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Run verification to see access requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {requests.map((req) => (
                <Card key={req.id} className={`border-l-4 ${
                  req.decision === 'allow' ? 'border-l-green-500' :
                  req.decision === 'deny' ? 'border-l-red-500' : 'border-l-yellow-500'
                }`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] ${getDecisionColor(req.decision)}`}>
                          {req.decision.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-mono">{req.identity.userId}</span>
                        <Badge variant="outline" className="text-[10px]">{req.identity.role}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(req.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-[10px]">
                      {/* Identity */}
                      <div className="p-2 rounded bg-muted/30">
                        <div className="font-medium mb-1 flex items-center gap-1">
                          <User className="h-3 w-3" /> Identity
                        </div>
                        <div>MFA: {req.identity.mfaVerified ? '✅' : '❌'}</div>
                        <div>Risk: <span className={req.identity.riskScore > 0.7 ? 'text-red-500' : 'text-green-500'}>
                          {(req.identity.riskScore * 100).toFixed(0)}%
                        </span></div>
                      </div>
                      {/* Device */}
                      <div className="p-2 rounded bg-muted/30">
                        <div className="font-medium mb-1 flex items-center gap-1">
                          <Monitor className="h-3 w-3" /> Device
                        </div>
                        <div>{req.device.type} ({req.device.os})</div>
                        <div>Trusted: {req.device.trusted ? '✅' : '❌'}</div>
                      </div>
                      {/* Context */}
                      <div className="p-2 rounded bg-muted/30">
                        <div className="font-medium mb-1 flex items-center gap-1">
                          <Globe className="h-3 w-3" /> Context
                        </div>
                        <div>{req.context.geoLocation} via {req.context.networkType}</div>
                        <div>Resource: {req.context.requestedResource}</div>
                      </div>
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      Policy: {req.policyMatched}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
