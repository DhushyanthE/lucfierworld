
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface NetworkNode {
  id: string;
  type: 'miner' | 'validator' | 'full' | 'light';
  connections: string[];
  status: 'active' | 'syncing' | 'inactive';
  isQuantum: boolean;
  performance: number;
  location: { x: number; y: number };
}

interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  transactionsPerSecond: number;
  averageBlockTime: number;
  quantumNodesPercentage: number;
  networkSecurity: number;
}

export function useNetworkState() {
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalNodes: 0,
    activeNodes: 0,
    transactionsPerSecond: 0,
    averageBlockTime: 0,
    quantumNodesPercentage: 0,
    networkSecurity: 0
  });
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    // Initialize the network nodes
    generateNetworkNodes();
  }, []);

  const generateNetworkNodes = () => {
    const nodeCount = 24;
    const nodes: NetworkNode[] = [];

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      const nodeType = getRandomNodeType();
      const isQuantum = Math.random() > 0.6;
      
      nodes.push({
        id: `node-${i + 1}`,
        type: nodeType,
        connections: [],
        status: Math.random() > 0.15 ? 'active' : (Math.random() > 0.5 ? 'syncing' : 'inactive'),
        isQuantum,
        performance: 0.6 + Math.random() * 0.4,
        location: {
          x: Math.random(),
          y: Math.random()
        }
      });
    }

    // Create connections between nodes
    nodes.forEach(node => {
      const connectionCount = 2 + Math.floor(Math.random() * 4); // 2-5 connections per node
      const potentialConnections = nodes
        .filter(n => n.id !== node.id && !node.connections.includes(n.id))
        .map(n => n.id);
      
      // Shuffle and pick the first few
      const shuffled = [...potentialConnections].sort(() => 0.5 - Math.random());
      node.connections = shuffled.slice(0, Math.min(connectionCount, shuffled.length));
    });

    setNetworkNodes(nodes);
    updateNetworkStats(nodes);
  };

  const updateNetworkStats = (nodes: NetworkNode[]) => {
    const activeNodes = nodes.filter(n => n.status === 'active').length;
    const quantumNodes = nodes.filter(n => n.isQuantum).length;
    
    setNetworkStats({
      totalNodes: nodes.length,
      activeNodes,
      transactionsPerSecond: 15 + Math.random() * 10,
      averageBlockTime: 12 + Math.random() * 4,
      quantumNodesPercentage: (quantumNodes / nodes.length) * 100,
      networkSecurity: calculateNetworkSecurity(nodes)
    });
  };

  const calculateNetworkSecurity = (nodes: NetworkNode[]): number => {
    // Calculate network security based on node types, connections, and quantum status
    const activeNodePercentage = nodes.filter(n => n.status === 'active').length / nodes.length;
    const quantumNodePercentage = nodes.filter(n => n.isQuantum).length / nodes.length;
    const avgConnections = nodes.reduce((sum, node) => sum + node.connections.length, 0) / nodes.length;
    const avgPerformance = nodes.reduce((sum, node) => sum + node.performance, 0) / nodes.length;
    
    // Weight the factors
    return (
      (activeNodePercentage * 30) +
      (quantumNodePercentage * 25) +
      (avgConnections / 10 * 20) +
      (avgPerformance * 25)
    );
  };

  const getRandomNodeType = (): 'miner' | 'validator' | 'full' | 'light' => {
    const types: ('miner' | 'validator' | 'full' | 'light')[] = ['miner', 'validator', 'full', 'light'];
    const weights = [0.2, 0.3, 0.3, 0.2]; // Weights for each type
    
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < types.length; i++) {
      sum += weights[i];
      if (random < sum) return types[i];
    }
    
    return 'full';
  };

  const optimizeNetwork = async () => {
    setIsOptimizing(true);
    
    // Simulate optimization delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Improve network by enhancing node performance and adding quantum nodes
    const optimizedNodes = networkNodes.map(node => ({
      ...node,
      status: node.status === 'inactive' && Math.random() > 0.7 ? 'active' : node.status,
      isQuantum: node.isQuantum || Math.random() > 0.7,
      performance: Math.min(1, node.performance + Math.random() * 0.2)
    }));
    
    // Add a few more connections
    optimizedNodes.forEach(node => {
      if (Math.random() > 0.6) {
        const potentialConnections = optimizedNodes
          .filter(n => n.id !== node.id && !node.connections.includes(n.id))
          .map(n => n.id);
          
        if (potentialConnections.length > 0) {
          const randomNodeId = potentialConnections[Math.floor(Math.random() * potentialConnections.length)];
          node.connections.push(randomNodeId);
          
          // Add bidirectional connection
          const targetNode = optimizedNodes.find(n => n.id === randomNodeId);
          if (targetNode && !targetNode.connections.includes(node.id)) {
            targetNode.connections.push(node.id);
          }
        }
      }
    });
    
    setNetworkNodes(optimizedNodes);
    updateNetworkStats(optimizedNodes);
    setIsOptimizing(false);
    
    toast.success("Network optimized", {
      description: "Quantum nodes and connections enhanced for better performance"
    });
  };

  return { networkNodes, networkStats, isOptimizing, optimizeNetwork };
}
