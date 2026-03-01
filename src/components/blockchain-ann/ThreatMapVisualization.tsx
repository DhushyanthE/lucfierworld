import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, RefreshCw, MapPin, Zap } from 'lucide-react';

interface ThreatOrigin {
  id: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
  threatType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  count: number;
  timestamp: string;
}

interface AttackVector {
  id: string;
  from: ThreatOrigin;
  to: { lat: number; lng: number; label: string };
  active: boolean;
  progress: number;
}

const WORLD_POINTS: { country: string; city: string; lat: number; lng: number }[] = [
  { country: 'Russia', city: 'Moscow', lat: 55.75, lng: 37.62 },
  { country: 'China', city: 'Beijing', lat: 39.9, lng: 116.4 },
  { country: 'North Korea', city: 'Pyongyang', lat: 39.03, lng: 125.75 },
  { country: 'Iran', city: 'Tehran', lat: 35.69, lng: 51.39 },
  { country: 'Brazil', city: 'São Paulo', lat: -23.55, lng: -46.63 },
  { country: 'Nigeria', city: 'Lagos', lat: 6.52, lng: 3.38 },
  { country: 'India', city: 'Mumbai', lat: 19.08, lng: 72.88 },
  { country: 'USA', city: 'New York', lat: 40.71, lng: -74.01 },
  { country: 'Germany', city: 'Berlin', lat: 52.52, lng: 13.41 },
  { country: 'UK', city: 'London', lat: 51.51, lng: -0.13 },
  { country: 'Ukraine', city: 'Kyiv', lat: 50.45, lng: 30.52 },
  { country: 'Romania', city: 'Bucharest', lat: 44.43, lng: 26.1 },
];

const THREAT_TYPES = ['Ransomware', 'DDoS', 'APT', 'Phishing', 'Brute Force', 'Zero-Day', 'C2'];
const TARGET = { lat: 37.77, lng: -122.42, label: 'HQ - San Francisco' };

function generateThreats(): ThreatOrigin[] {
  const severities: ThreatOrigin['severity'][] = ['critical', 'high', 'medium', 'low'];
  return WORLD_POINTS
    .sort(() => Math.random() - 0.5)
    .slice(0, 6 + Math.floor(Math.random() * 5))
    .map((pt, i) => ({
      id: `threat-${i}`,
      ...pt,
      threatType: THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      count: 1 + Math.floor(Math.random() * 500),
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    }));
}

// Convert lat/lng to SVG coordinates (simple equirectangular)
function toSvg(lat: number, lng: number): { x: number; y: number } {
  return { x: ((lng + 180) / 360) * 800, y: ((90 - lat) / 180) * 400 };
}

const severityColor: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export function ThreatMapVisualization() {
  const [threats, setThreats] = useState<ThreatOrigin[]>([]);
  const [vectors, setVectors] = useState<AttackVector[]>([]);
  const [isLive, setIsLive] = useState(false);

  const refresh = useCallback(() => {
    const t = generateThreats();
    setThreats(t);
    setVectors(t.map((th, i) => ({
      id: `vec-${i}`,
      from: th,
      to: TARGET,
      active: th.severity === 'critical' || th.severity === 'high',
      progress: Math.random(),
    })));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [isLive, refresh]);

  const target = toSvg(TARGET.lat, TARGET.lng);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-emerald-600/5 to-cyan-600/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-emerald-500" />
                Real-Time Threat Map
              </CardTitle>
              <CardDescription>Geographic origins of detected threats with attack vectors</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant={isLive ? 'default' : 'outline'} size="sm" onClick={() => setIsLive(!isLive)}>
                {isLive ? <Zap className="h-4 w-4 mr-1 animate-pulse" /> : <Zap className="h-4 w-4 mr-1" />}
                {isLive ? 'Live' : 'Start Live'}
              </Button>
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* SVG World Map */}
          <div className="relative rounded-lg bg-muted/30 border overflow-hidden">
            <svg viewBox="0 0 800 400" className="w-full h-auto" style={{ minHeight: 300 }}>
              {/* Grid lines */}
              {Array.from({ length: 7 }, (_, i) => (
                <line key={`h${i}`} x1={0} y1={i * 66.67} x2={800} y2={i * 66.67} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.1} />
              ))}
              {Array.from({ length: 13 }, (_, i) => (
                <line key={`v${i}`} x1={i * 66.67} y1={0} x2={i * 66.67} y2={400} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.1} />
              ))}

              {/* Simplified continent outlines */}
              <ellipse cx={200} cy={160} rx={80} ry={40} fill="hsl(var(--muted))" opacity={0.3} />
              <ellipse cx={400} cy={150} rx={60} ry={50} fill="hsl(var(--muted))" opacity={0.3} />
              <ellipse cx={500} cy={170} rx={80} ry={60} fill="hsl(var(--muted))" opacity={0.3} />
              <ellipse cx={430} cy={270} rx={30} ry={40} fill="hsl(var(--muted))" opacity={0.3} />
              <ellipse cx={600} cy={200} rx={50} ry={40} fill="hsl(var(--muted))" opacity={0.3} />
              <ellipse cx={680} cy={280} rx={40} ry={30} fill="hsl(var(--muted))" opacity={0.3} />
              <ellipse cx={280} cy={280} rx={30} ry={50} fill="hsl(var(--muted))" opacity={0.3} />

              {/* Attack vectors */}
              {vectors.filter(v => v.active).map((v) => {
                const from = toSvg(v.from.lat, v.from.lng);
                const to = target;
                return (
                  <g key={v.id}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={severityColor[v.from.severity]} strokeWidth={1.5} strokeOpacity={0.4}
                      strokeDasharray="6 4">
                      <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1.5s" repeatCount="indefinite" />
                    </line>
                    {/* Moving dot */}
                    <circle r={3} fill={severityColor[v.from.severity]}>
                      <animateMotion dur="2s" repeatCount="indefinite"
                        path={`M${from.x},${from.y} L${to.x},${to.y}`} />
                    </circle>
                  </g>
                );
              })}

              {/* Target (HQ) */}
              <circle cx={target.x} cy={target.y} r={8} fill="hsl(var(--primary))" opacity={0.3}>
                <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={target.x} cy={target.y} r={4} fill="hsl(var(--primary))" />
              <text x={target.x + 10} y={target.y + 4} fontSize={8} fill="hsl(var(--primary))" fontWeight="bold">HQ</text>

              {/* Threat origins */}
              {threats.map((th) => {
                const pos = toSvg(th.lat, th.lng);
                return (
                  <g key={th.id}>
                    <circle cx={pos.x} cy={pos.y} r={Math.min(3 + th.count / 50, 12)}
                      fill={severityColor[th.severity]} opacity={0.2}>
                      <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={pos.x} cy={pos.y} r={3} fill={severityColor[th.severity]} />
                    <text x={pos.x + 6} y={pos.y - 4} fontSize={7} fill="hsl(var(--foreground))" opacity={0.8}>
                      {th.city}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Threat summary table */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {['critical', 'high', 'medium', 'low'].map((sev) => {
              const count = threats.filter(t => t.severity === sev).length;
              return (
                <div key={sev} className="p-3 rounded-lg bg-muted/50 text-center">
                  <div className="text-2xl font-bold" style={{ color: severityColor[sev] }}>{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">{sev}</div>
                </div>
              );
            })}
          </div>

          {/* Threat list */}
          <div className="mt-4 space-y-1 max-h-48 overflow-y-auto">
            {threats.sort((a, b) => {
              const ord = { critical: 0, high: 1, medium: 2, low: 3 };
              return ord[a.severity] - ord[b.severity];
            }).map((th) => (
              <div key={th.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" style={{ color: severityColor[th.severity] }} />
                  <span className="font-medium">{th.city}, {th.country}</span>
                  <Badge variant="outline" className="text-[10px]">{th.threatType}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{th.count} attacks</span>
                  <Badge className="text-[10px]" style={{ backgroundColor: severityColor[th.severity], color: '#fff' }}>
                    {th.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
