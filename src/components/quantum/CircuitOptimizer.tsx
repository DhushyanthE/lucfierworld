
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cpu, Zap } from 'lucide-react';
import { circuitOptimizer } from '@/lib/quantum/CircuitOptimizer';

export function CircuitOptimizer() {
  return (
    <Card className="bg-black/70 border-purple-500/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-purple-400" />
          <span>Circuit Optimizer</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 mb-4">
          Optimize quantum circuits using advanced algorithms and AGI-powered techniques to improve 
          performance, reduce gate count, and enhance fidelity.
        </p>
        
        <Button className="w-full bg-purple-600 hover:bg-purple-700">
          <Zap className="h-4 w-4 mr-2" />
          Open Circuit Optimizer
        </Button>
      </CardContent>
    </Card>
  );
}
