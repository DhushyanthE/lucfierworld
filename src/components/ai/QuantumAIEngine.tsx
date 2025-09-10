
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Cpu, Database, Network, Server, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProgressCircle } from './ProgressCircle';
import { toast } from 'sonner';
import { aiService } from '@/services/aiService';

interface QuantumAIEngineProps {
  tokenSymbol: string;
}

export function QuantumAIEngine({ tokenSymbol }: QuantumAIEngineProps) {
  const [systemStatus, setSystemStatus] = useState<Record<string, number>>({
    dataProcessing: 0,
    quantumComputing: 0,
    neuralNetworks: 0,
    predictionEngine: 0,
  });

  const [isInitializing, setIsInitializing] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const initializeSystem = async () => {
      // Add initial log
      addLog('Initializing Quantum AI Engine...');
      
      // Simulate system initialization with stepped progress
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 50));
        
        setSystemStatus({
          dataProcessing: Math.min(100, i + Math.random() * 10),
          quantumComputing: Math.min(100, i - 10 + Math.random() * 15),
          neuralNetworks: Math.min(100, i - 20 + Math.random() * 20),
          predictionEngine: Math.min(100, i - 30 + Math.random() * 25)
        });
        
        if (i === 25) addLog('Loading market data from distributed nodes...');
        if (i === 50) addLog('Initializing quantum computation matrix...');
        if (i === 75) addLog('Calibrating neural network parameters...');
        if (i === 95) addLog(`${tokenSymbol} prediction models activated.`);
      }
      
      setIsInitializing(false);
      addLog('Quantum AI Engine fully operational.');
      
      toast.success('Quantum AI Engine online', {
        description: 'All systems operational and ready for analysis',
      });
      
      // Set up periodic status updates
      const interval = setInterval(() => {
        setSystemStatus(prevStatus => ({
          dataProcessing: 95 + Math.random() * 5,
          quantumComputing: 92 + Math.random() * 8,
          neuralNetworks: 90 + Math.random() * 10,
          predictionEngine: 94 + Math.random() * 6
        }));
        
        // Occasionally add logs to simulate activity
        if (Math.random() > 0.7) {
          const possibleLogs = [
            `Processing new ${tokenSymbol} market data batch...`,
            'Quantum circuit optimization complete',
            `Neural pattern detected: ${tokenSymbol} volume increase`,
            'Refreshing blockchain transaction analysis',
            'Security verification passed for prediction model',
            'Cross-referencing data from 42 exchanges'
          ];
          addLog(possibleLogs[Math.floor(Math.random() * possibleLogs.length)]);
        }
      }, 3000);
      
      return () => clearInterval(interval);
    };

    initializeSystem();
  }, [tokenSymbol]);

  const addLog = (message: string) => {
    setLogs(prev => {
      const timestamp = new Date().toLocaleTimeString();
      const newLogs = [...prev, `[${timestamp}] ${message}`];
      
      // Keep only the most recent 100 logs
      if (newLogs.length > 8) {
        return newLogs.slice(newLogs.length - 8);
      }
      return newLogs;
    });
  };

  const systemComponents = [
    { 
      name: 'Data Processing', 
      icon: <Database className="h-5 w-5" />, 
      status: systemStatus.dataProcessing,
      description: 'Real-time market data aggregation from 42 exchanges'
    },
    { 
      name: 'Quantum Computing', 
      icon: <Cpu className="h-5 w-5" />, 
      status: systemStatus.quantumComputing,
      description: 'Quantum-enhanced processing for complex calculations'
    },
    { 
      name: 'Neural Networks', 
      icon: <Network className="h-5 w-5" />, 
      status: systemStatus.neuralNetworks,
      description: '5-layer deep neural network with self-optimization'
    },
    { 
      name: 'Prediction Engine', 
      icon: <BrainCircuit className="h-5 w-5" />, 
      status: systemStatus.predictionEngine,
      description: 'Advanced forecasting system for market trends'
    },
  ];

  const getStatusColor = (status: number) => {
    if (status > 95) return "text-green-500";
    if (status > 80) return "text-blue-500";
    if (status > 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-purple-400" /> 
            <span>Quantum AI Engine</span>
          </div>
          <Badge 
            variant="outline" 
            className={isInitializing ? "bg-yellow-900/30 text-yellow-400" : "bg-green-900/30 text-green-400"}
          >
            {isInitializing ? (
              <><Zap className="h-3.5 w-3.5 mr-1 animate-pulse" /> Initializing</>
            ) : (
              <><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Online</>
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {systemComponents.map((component) => (
            <div 
              key={component.name}
              className="bg-black/50 border border-gray-800 rounded-lg p-3 flex items-center"
            >
              <ProgressCircle 
                progress={component.status} 
                size={50}
                strokeWidth={5}
                circleColor="#8b5cf6"
              />
              <div className="ml-3">
                <div className="flex items-center">
                  {component.icon}
                  <h3 className="text-sm font-medium ml-1.5">{component.name}</h3>
                </div>
                <div className={`text-xs ${getStatusColor(component.status)}`}>
                  {component.status.toFixed(1)}% Operational
                </div>
                <p className="text-xs text-gray-400 mt-0.5 max-w-[180px] truncate">
                  {component.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-black/50 border border-gray-800 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium flex items-center">
              <Server className="h-4 w-4 mr-1.5 text-purple-400" />
              System Logs
            </h3>
            <span className="text-xs text-gray-500">
              Last update: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="bg-black/70 border border-gray-800 rounded p-2 text-xs font-mono h-[160px] overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="text-gray-300 pb-1">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">System initializing...</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
