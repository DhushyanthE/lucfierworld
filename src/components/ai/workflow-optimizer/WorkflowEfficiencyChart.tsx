
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkflowState } from '@/components/tokenomics/analysis/useQuantumAnalysis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WorkflowEfficiencyChartProps {
  workflow: WorkflowState;
  neuralNetworkActive: boolean;
}

export function WorkflowEfficiencyChart({ workflow, neuralNetworkActive }: WorkflowEfficiencyChartProps) {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate chart data based on workflow state
    const generateChartData = () => {
      // Check if workflow has been run
      if (!workflow.startedAt) {
        // Generate sample data
        return Array(12).fill(0).map((_, i) => ({
          time: i,
          efficiency: 0,
          transactions: 0,
          security: 0,
        }));
      }
      
      // Calculate time elapsed since workflow started
      const elapsedMs = workflow.completedAt 
        ? workflow.completedAt.getTime() - workflow.startedAt.getTime()
        : new Date().getTime() - workflow.startedAt.getTime();
      
      const points = 12;
      const chartData = [];
      
      // For each point, calculate metrics based on workflow state
      for (let i = 0; i < points; i++) {
        const timePoint = i / (points - 1);
        const progressPoint = Math.min(1, timePoint * 1.2); // Progress is slightly ahead of time
        
        // Find which step should be active at this time point
        const stepCount = Object.keys(workflow.steps).length;
        const expectedStepIndex = Math.floor(progressPoint * stepCount);
        const stepKeys = Object.keys(workflow.steps);
        const currentStepId = stepKeys[Math.min(expectedStepIndex, stepKeys.length - 1)];
        const currentStep = workflow.steps[currentStepId];
        
        // Calculate metrics
        let efficiency = 0;
        let transactions = 0;
        let security = 0;
        
        if (i === 0) {
          efficiency = 20 + Math.random() * 10;
          transactions = 5 + Math.random() * 5;
          security = 50 + Math.random() * 10;
        } else {
          const prevPoint = chartData[i - 1];
          
          // Efficiency increases as workflow progresses
          efficiency = prevPoint.efficiency + (3 + Math.random() * 4);
          efficiency = Math.min(efficiency, 95);
          
          // Transactions spike during blockchain integration
          if (currentStepId === 'blockchainIntegration') {
            transactions = prevPoint.transactions + (20 + Math.random() * 10);
          } else {
            transactions = prevPoint.transactions + (2 + Math.random() * 3);
          }
          
          // Security improves during security evaluation
          if (currentStepId === 'securityEvaluation') {
            security = prevPoint.security + (15 + Math.random() * 5);
          } else {
            security = prevPoint.security + (1 + Math.random() * 2);
          }
          security = Math.min(security, 98);
        }
        
        // Neural network boost
        if (neuralNetworkActive) {
          efficiency *= 1.15;
          transactions *= 1.08;
          security *= 1.05;
        }
        
        chartData.push({
          time: Math.round(timePoint * elapsedMs / 1000), // Convert to seconds
          efficiency: Math.min(100, Math.round(efficiency)),
          transactions: Math.round(transactions),
          security: Math.min(100, Math.round(security)),
          step: currentStepId
        });
      }
      
      return chartData;
    };
    
    setData(generateChartData());
    
    // Update chart while workflow is running
    if (workflow.isRunning) {
      const interval = setInterval(() => {
        setData(generateChartData());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [workflow, neuralNetworkActive]);
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 border border-gray-800 p-2 rounded text-xs">
          <p className="text-gray-400">{`Time: ${label}s`}</p>
          <p className="text-blue-400">{`Efficiency: ${payload[0].value}%`}</p>
          <p className="text-green-400">{`Transactions: ${payload[1].value}`}</p>
          <p className="text-purple-400">{`Security: ${payload[2].value}%`}</p>
          {payload[0].payload.step && (
            <p className="text-gray-400 mt-1">
              Step: {payload[0].payload.step.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="bg-gray-900/50 border-purple-500/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm text-white">Workflow Efficiency Metrics</CardTitle>
        <CardDescription>Real-time metrics across workflow execution</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }} 
              style={{ fontSize: '0.7rem', fill: '#94a3b8' }}
            />
            <YAxis style={{ fontSize: '0.7rem', fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="efficiency" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false} 
              activeDot={{ r: 4 }} 
            />
            <Line 
              type="monotone" 
              dataKey="transactions" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false} 
              activeDot={{ r: 4 }} 
            />
            <Line 
              type="monotone" 
              dataKey="security" 
              stroke="#a855f7" 
              strokeWidth={2}
              dot={false} 
              activeDot={{ r: 4 }} 
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-center mt-2 gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-400">Efficiency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-400">Transactions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-xs text-gray-400">Security</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
