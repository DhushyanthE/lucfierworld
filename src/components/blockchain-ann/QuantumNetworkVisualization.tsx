/**
 * Multi-Party Quantum Network Visualization
 * Shows node connections and entanglement distribution across the network
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Network, RefreshCw, Play, Pause, Zap, 
  Circle, Link2, Shield, Activity
} from 'lucide-react';

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'quantum' | 'relay' | 'endpoint';
  entanglementLevel: number;
  isActive: boolean;
  connections: string[];
}

interface EntanglementLink {
  source: string;
  target: string;
  strength: number;
  isActive: boolean;
}

const generateNetworkNodes = (count: number): NetworkNode[] => {
  const nodes: NetworkNode[] = [];
  const centerX = 300;
  const centerY = 200;
  const radius = 150;

  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count;
    const jitter = Math.random() * 30 - 15;
    
    nodes.push({
      id: `node_${i}`,
      x: centerX + (radius + jitter) * Math.cos(angle),
      y: centerY + (radius + jitter) * Math.sin(angle),
      label: `Q${i + 1}`,
      type: i === 0 ? 'endpoint' : i === count - 1 ? 'endpoint' : Math.random() > 0.7 ? 'relay' : 'quantum',
      entanglementLevel: Math.random() * 0.4 + 0.6,
      isActive: true,
      connections: []
    });
  }

  // Generate connections
  nodes.forEach((node, idx) => {
    const nextIdx = (idx + 1) % count;
    node.connections.push(nodes[nextIdx].id);
    
    // Add some cross connections
    if (Math.random() > 0.6 && count > 4) {
      const crossIdx = (idx + Math.floor(count / 2)) % count;
      if (!node.connections.includes(nodes[crossIdx].id)) {
        node.connections.push(nodes[crossIdx].id);
      }
    }
  });

  return nodes;
};

const generateLinks = (nodes: NetworkNode[]): EntanglementLink[] => {
  const links: EntanglementLink[] = [];
  const addedPairs = new Set<string>();

  nodes.forEach(node => {
    node.connections.forEach(targetId => {
      const pairKey = [node.id, targetId].sort().join('-');
      if (!addedPairs.has(pairKey)) {
        addedPairs.add(pairKey);
        links.push({
          source: node.id,
          target: targetId,
          strength: Math.random() * 0.3 + 0.7,
          isActive: true
        });
      }
    });
  });

  return links;
};

export function QuantumNetworkVisualization() {
  const [nodeCount, setNodeCount] = useState(8);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [links, setLinks] = useState<EntanglementLink[]>([]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [entanglementPhase, setEntanglementPhase] = useState(0);
  const animationRef = useRef<number>();

  // Initialize network
  useEffect(() => {
    const newNodes = generateNetworkNodes(nodeCount);
    const newLinks = generateLinks(newNodes);
    setNodes(newNodes);
    setLinks(newLinks);
  }, [nodeCount]);

  // Animation loop
  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const animate = () => {
      setEntanglementPhase(prev => (prev + 0.02) % (2 * Math.PI));
      
      // Update node entanglement levels with wave effect
      setNodes(prev => prev.map((node, idx) => ({
        ...node,
        entanglementLevel: 0.6 + 0.4 * Math.sin(entanglementPhase + idx * 0.5)
      })));

      // Update link activity
      setLinks(prev => prev.map(link => ({
        ...link,
        strength: 0.7 + 0.3 * Math.sin(entanglementPhase * 2)
      })));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAnimating, entanglementPhase]);

  const regenerateNetwork = useCallback(() => {
    const newNodes = generateNetworkNodes(nodeCount);
    const newLinks = generateLinks(newNodes);
    setNodes(newNodes);
    setLinks(newLinks);
    setSelectedNode(null);
  }, [nodeCount]);

  const getNodeColor = (node: NetworkNode) => {
    switch (node.type) {
      case 'endpoint': return 'fill-green-500';
      case 'relay': return 'fill-yellow-500';
      default: return 'fill-primary';
    }
  };

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  const averageEntanglement = nodes.length > 0
    ? nodes.reduce((acc, n) => acc + n.entanglementLevel, 0) / nodes.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <Network className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Multi-Party Quantum Network</CardTitle>
                <CardDescription>
                  Visualization of node connections and entanglement distribution
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {nodes.length} Nodes
              </Badge>
              <Badge variant="outline" className="text-sm">
                {links.length} Links
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAnimating(!isAnimating)}
              >
                {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={regenerateNetwork}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Network Visualization */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="relative bg-muted/30 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <svg width="100%" height="100%" viewBox="0 0 600 400">
                {/* Entanglement Links */}
                <g className="links">
                  {links.map((link, idx) => {
                    const source = getNodePosition(link.source);
                    const target = getNodePosition(link.target);
                    const opacity = link.strength * (isAnimating ? 0.5 + 0.5 * Math.sin(entanglementPhase * 3 + idx) : 1);
                    
                    return (
                      <g key={`link-${idx}`}>
                        {/* Glow effect */}
                        <line
                          x1={source.x}
                          y1={source.y}
                          x2={target.x}
                          y2={target.y}
                          stroke="hsl(var(--primary))"
                          strokeWidth={4}
                          strokeOpacity={opacity * 0.3}
                          className="blur-sm"
                        />
                        {/* Main line */}
                        <line
                          x1={source.x}
                          y1={source.y}
                          x2={target.x}
                          y2={target.y}
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          strokeOpacity={opacity}
                          strokeDasharray={link.isActive ? "none" : "5,5"}
                        />
                        {/* Animated particle */}
                        {isAnimating && (
                          <circle
                            r="3"
                            fill="hsl(var(--primary))"
                            className="animate-pulse"
                          >
                            <animateMotion
                              dur={`${2 + idx * 0.2}s`}
                              repeatCount="indefinite"
                              path={`M${source.x},${source.y} L${target.x},${target.y}`}
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* Network Nodes */}
                <g className="nodes">
                  {nodes.map((node, idx) => {
                    const pulseScale = isAnimating ? 1 + 0.1 * Math.sin(entanglementPhase * 2 + idx) : 1;
                    
                    return (
                      <g 
                        key={node.id} 
                        transform={`translate(${node.x}, ${node.y})`}
                        className="cursor-pointer transition-transform hover:scale-110"
                        onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                      >
                        {/* Outer glow ring */}
                        <circle
                          r={25 * pulseScale}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          strokeOpacity={node.entanglementLevel * 0.5}
                          className={selectedNode?.id === node.id ? 'animate-ping' : ''}
                        />
                        {/* Entanglement aura */}
                        <circle
                          r={18 * pulseScale}
                          fill="hsl(var(--primary))"
                          fillOpacity={node.entanglementLevel * 0.2}
                        />
                        {/* Node core */}
                        <circle
                          r={12}
                          className={getNodeColor(node)}
                          stroke={selectedNode?.id === node.id ? 'white' : 'none'}
                          strokeWidth={2}
                        />
                        {/* Node label */}
                        <text
                          y={30}
                          textAnchor="middle"
                          className="fill-foreground text-xs font-medium"
                        >
                          {node.label}
                        </text>
                        {/* Type indicator */}
                        {node.type === 'endpoint' && (
                          <circle r={4} cy={-8} fill="white" />
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Quantum Node</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Endpoint</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Relay</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls & Info */}
        <div className="space-y-4">
          {/* Node Count Slider */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Network Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Slider
                  value={[nodeCount]}
                  onValueChange={([val]) => setNodeCount(val)}
                  min={4}
                  max={16}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>4 nodes</span>
                  <span className="font-medium">{nodeCount} nodes</span>
                  <span>16 nodes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Network Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Entanglement</span>
                <span className="font-mono">{(averageEntanglement * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Links</span>
                <span className="font-mono">{links.filter(l => l.isActive).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Endpoints</span>
                <span className="font-mono">{nodes.filter(n => n.type === 'endpoint').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Relay Nodes</span>
                <span className="font-mono">{nodes.filter(n => n.type === 'relay').length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Selected Node Info */}
          {selectedNode && (
            <Card className="border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  {selectedNode.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline" className="capitalize">{selectedNode.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entanglement</span>
                  <span className="font-mono">{(selectedNode.entanglementLevel * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Connections</span>
                  <span className="font-mono">{selectedNode.connections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={selectedNode.isActive ? 'default' : 'destructive'}>
                    {selectedNode.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
