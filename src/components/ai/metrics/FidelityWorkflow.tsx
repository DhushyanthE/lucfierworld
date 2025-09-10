
import React from 'react';
import { Workflow, Cpu, Brain, Activity, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define DatabaseIcon component to avoid the Database import conflict 
function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

interface FidelityWorkflowProps {
  workflowActive: boolean;
  setWorkflowActive: (active: boolean) => void;
}

export function FidelityWorkflow({ workflowActive, setWorkflowActive }: FidelityWorkflowProps) {
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <Brain className="h-4 w-4 text-purple-400" />
        <div className="text-sm font-medium">Fidelity Machine Learning Insights</div>
        <div className="ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 bg-black/50 border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
            onClick={() => setWorkflowActive(!workflowActive)}
          >
            <Workflow className="h-3.5 w-3.5 mr-1.5" />
            {workflowActive ? 'Hide Workflow' : 'Show Workflow'}
          </Button>
        </div>
      </div>
      
      {workflowActive && (
        <div className="mb-4 p-3 rounded-lg bg-black/30 border border-purple-500/10">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {['Data Collection', 'Quantum Processing', 'Model Training', 'Fidelity Analysis', 'Security Validation'].map((step, i) => (
              <div key={i} className="flex flex-col items-center min-w-[100px]">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${i <= 3 ? 'bg-purple-900/40 text-purple-300' : 'bg-gray-800/40 text-gray-400'}`}>
                  {i === 0 ? <DatabaseIcon className="h-4 w-4" /> :
                   i === 1 ? <Cpu className="h-4 w-4" /> :
                   i === 2 ? <Brain className="h-4 w-4" /> :
                   i === 3 ? <Activity className="h-4 w-4" /> :
                   <Shield className="h-4 w-4" />}
                </div>
                <div className="text-xs text-center">{step}</div>
                <div className="mt-1 h-1 w-full bg-gray-800 rounded-full">
                  <div 
                    className="h-full bg-purple-600 rounded-full" 
                    style={{ width: `${i <= 3 ? 100 : 30}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
