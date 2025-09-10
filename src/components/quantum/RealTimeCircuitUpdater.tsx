
import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface RealTimeCircuitUpdaterProps {
  isConnected: boolean;
  entanglementScore: number;
}

export function RealTimeCircuitUpdater({ 
  isConnected, 
  entanglementScore 
}: RealTimeCircuitUpdaterProps) {
  const [updateProgress, setUpdateProgress] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [status, setStatus] = useState<'idle' | 'syncing' | 'optimizing' | 'complete'>('idle');
  const [syncStats, setSyncStats] = useState({
    gates: 0,
    qubits: 0,
    depth: 0,
    errorRate: 0,
  });

  const updateInterval = useRef<number | null>(null);
  const statusCycle = useRef<number>(0);

  useEffect(() => {
    // Only start updates if connected
    if (isConnected) {
      startUpdates();
    } else {
      stopUpdates();
      setStatus('idle');
      setUpdateProgress(0);
    }

    return () => {
      if (updateInterval.current) {
        window.clearInterval(updateInterval.current);
      }
    };
  }, [isConnected]);

  // Start periodic updates
  const startUpdates = () => {
    if (updateInterval.current) {
      window.clearInterval(updateInterval.current);
    }

    // Update every 5 seconds
    updateInterval.current = window.setInterval(() => {
      // Cycle through different update states to simulate real-time processing
      statusCycle.current = (statusCycle.current + 1) % 20;
      
      if (statusCycle.current < 5) {
        simulateSyncing();
      } else if (statusCycle.current < 7) {
        simulateOptimizing();
      } else {
        setStatus('idle');
        setUpdateProgress(0);
      }

      // Update sync stats periodically with fluctuations
      setSyncStats(prev => ({
        gates: Math.max(5, prev.gates + Math.floor(Math.random() * 5) - 2),
        qubits: Math.max(2, Math.min(12, prev.qubits + (Math.random() > 0.7 ? 1 : 0) - (Math.random() > 0.8 ? 1 : 0))),
        depth: Math.max(2, prev.depth + Math.floor(Math.random() * 3) - 1),
        errorRate: Math.max(0.01, Math.min(0.1, prev.errorRate + (Math.random() * 0.02 - 0.01))),
      }));
    }, 5000);
  };

  const stopUpdates = () => {
    if (updateInterval.current) {
      window.clearInterval(updateInterval.current);
      updateInterval.current = null;
    }
  };

  const simulateSyncing = () => {
    setStatus('syncing');
    
    // Simulate progress updates
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        setStatus('complete');
        setLastUpdate(new Date());
        
        // Show success toast
        toast.success("Circuit synced with quantum processor", {
          description: `Synchronized ${syncStats.gates} gates across ${syncStats.qubits} qubits`
        });
      }
      setUpdateProgress(progress);
    }, 200);
  };

  const simulateOptimizing = () => {
    setStatus('optimizing');
    
    // Simulate optimization progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(progressInterval);
        setStatus('complete');
        setLastUpdate(new Date());
        
        // Calculate improvement percentage (random between 5-20%)
        const improvement = Math.floor(Math.random() * 15 + 5);
        
        // Show success toast for optimization
        toast.success("Circuit optimization complete", {
          description: `Improved efficiency by ${improvement}%`
        });
      }
      setUpdateProgress(progress);
    }, 150);
  };

  // Get status badge styling based on current status
  const getStatusBadge = () => {
    switch (status) {
      case 'syncing':
        return <Badge className="bg-blue-900/30 text-blue-300 border-blue-800/50">Syncing</Badge>;
      case 'optimizing':
        return <Badge className="bg-purple-900/30 text-purple-300 border-purple-800/50">Optimizing</Badge>;
      case 'complete':
        return <Badge className="bg-green-900/30 text-green-300 border-green-800/50">Complete</Badge>;
      default:
        return <Badge className="bg-gray-900/30 text-gray-300 border-gray-800/50">Idle</Badge>;
    }
  };

  // Only show the component if connected
  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-3 mb-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <div className="text-sm text-white">Real-time Circuit Updates</div>
            {getStatusBadge()}
          </div>
          
          <div className="text-xs text-gray-400">
            Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'None'}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-400">Entanglement Score</div>
          <div className="text-sm text-white font-mono">
            {(entanglementScore * 100).toFixed(2)}%
          </div>
        </div>
      </div>
      
      {status !== 'idle' && (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <div className="text-gray-400">
              {status === 'syncing' ? 'Synchronizing quantum state' : 
               status === 'optimizing' ? 'Optimizing circuit' : 'Processing'}
            </div>
            <div className="text-gray-400">{Math.round(updateProgress)}%</div>
          </div>
          <Progress value={updateProgress} className="h-1" />
        </div>
      )}
      
      <div className="mt-3 grid grid-cols-4 gap-2">
        <div className="text-xs">
          <div className="text-gray-400">Gates</div>
          <div className="text-white">{syncStats.gates}</div>
        </div>
        <div className="text-xs">
          <div className="text-gray-400">Qubits</div>
          <div className="text-white">{syncStats.qubits}</div>
        </div>
        <div className="text-xs">
          <div className="text-gray-400">Circuit Depth</div>
          <div className="text-white">{syncStats.depth}</div>
        </div>
        <div className="text-xs">
          <div className="text-gray-400">Error Rate</div>
          <div className="text-white">{(syncStats.errorRate * 100).toFixed(2)}%</div>
        </div>
      </div>
    </div>
  );
}
