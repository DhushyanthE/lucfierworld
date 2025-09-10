
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Check, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { executeSecurityAssessment, SecurityAssessmentStep, SecurityFinding } from '@/workflows/securityWorkflow';

export function SecurityWorkflow() {
  const [steps, setSteps] = useState<SecurityAssessmentStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const startAssessment = async () => {
    setIsRunning(true);
    const result = await executeSecurityAssessment();
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

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-600">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-600">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-600">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-600">Low</Badge>;
      default:
        return <Badge className="bg-gray-600">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-black/70 border-purple-500/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-400" />
          Security Assessment Workflow
        </CardTitle>
        <Button
          onClick={startAssessment}
          disabled={isRunning}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Assessing
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Start Assessment
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
              
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-purple-600 transition-all duration-500"
                  style={{ width: `${step.progress}%` }}
                ></div>
              </div>

              {step.findings.length > 0 && step.status === 'completed' && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-medium text-gray-400">Findings:</h4>
                  {step.findings.map((finding, index) => (
                    <div 
                      key={index}
                      className="bg-gray-900/50 border border-gray-800 rounded p-3"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          finding.severity === 'critical' ? 'text-red-500' :
                          finding.severity === 'high' ? 'text-orange-500' :
                          finding.severity === 'medium' ? 'text-yellow-500' :
                          'text-green-500'
                        }`} />
                        {getSeverityBadge(finding.severity)}
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{finding.description}</p>
                      <p className="text-xs text-gray-400">
                        Recommendation: {finding.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {steps.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-4 text-purple-400 opacity-50" />
              <p>Click "Start Assessment" to begin the security assessment process</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
