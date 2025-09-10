
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Languages, Check, Loader2, AlertCircle, Globe } from 'lucide-react';
import { executeMultilingualWorkflow, MultilingualWorkflowStep } from '@/workflows/multilingualWorkflow';

export function MultilingualWorkflow() {
  const [steps, setSteps] = useState<MultilingualWorkflowStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const startWorkflow = async () => {
    setIsRunning(true);
    const targetLanguages = ['es', 'fr', 'de', 'it', 'ja']; // Example languages
    const result = await executeMultilingualWorkflow(targetLanguages);
    setSteps(result.steps);
    setIsRunning(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600"><Check className="w-3 h-3 mr-1" /> Complete</Badge>;
      case 'running':
        return <Badge className="bg-blue-600"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Running</Badge>;
      case 'failed':
        return <Badge className="bg-red-600"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge className="bg-gray-600">Pending</Badge>;
    }
  };

  return (
    <Card className="bg-black/70 border-purple-500/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="h-5 w-5 text-purple-400" />
          Multilingual Support Workflow
        </CardTitle>
        <Button
          onClick={startWorkflow}
          disabled={isRunning}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing
            </>
          ) : (
            <>
              <Languages className="w-4 h-4 mr-2" />
              Start Workflow
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step) => (
            <div 
              key={step.id}
              className="bg-black/50 border border-purple-500/20 rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-medium">{step.name}</h3>
                {getStatusBadge(step.status)}
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 transition-all duration-500"
                  style={{ width: `${step.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
          
          {steps.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Languages className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-50" />
              <p>Click "Start Workflow" to begin the multilingual support process</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
