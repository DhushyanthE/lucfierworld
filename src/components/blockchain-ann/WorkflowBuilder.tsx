/**
 * Workflow Builder Component
 * 
 * Visual workflow designer with drag-and-drop task configuration
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { WorkflowStep } from '@/types/blockchain-ann.types';
import { 
  Database, 
  Cpu, 
  Zap, 
  CheckCircle, 
  Upload, 
  Brain,
  Plus,
  Trash2,
  ArrowRight,
  Play,
  Save
} from 'lucide-react';

interface WorkflowBuilderProps {
  onSave: (workflow: WorkflowData) => void;
  onExecute: (workflow: WorkflowData) => void;
}

export interface WorkflowData {
  name: string;
  description: string;
  steps: Omit<WorkflowStep, 'id' | 'status' | 'progress'>[];
}

const STEP_TEMPLATES = [
  { 
    type: 'data-loading' as const, 
    name: 'Load Data',
    icon: Database,
    color: 'text-blue-500',
    description: 'Load training data from blockchain or external source'
  },
  { 
    type: 'preprocessing' as const, 
    name: 'Preprocess Data',
    icon: Cpu,
    color: 'text-purple-500',
    description: 'Normalize, augment, and prepare data for training'
  },
  { 
    type: 'training' as const, 
    name: 'Train Model',
    icon: Zap,
    color: 'text-yellow-500',
    description: 'Train neural network with distributed nodes'
  },
  { 
    type: 'validation' as const, 
    name: 'Validate Model',
    icon: CheckCircle,
    color: 'text-green-500',
    description: 'Validate model accuracy with blockchain consensus'
  },
  { 
    type: 'deployment' as const, 
    name: 'Deploy to Blockchain',
    icon: Upload,
    color: 'text-orange-500',
    description: 'Deploy trained model as smart contract'
  },
  { 
    type: 'inference' as const, 
    name: 'Run Inference',
    icon: Brain,
    color: 'text-pink-500',
    description: 'Execute predictions with blockchain verification'
  }
];

export function WorkflowBuilder({ onSave, onExecute }: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<WorkflowData>({
    name: 'New Workflow',
    description: 'Blockchain-ANN workflow',
    steps: []
  });

  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);

  const addStep = (templateType: typeof STEP_TEMPLATES[0]['type']) => {
    const template = STEP_TEMPLATES.find(t => t.type === templateType);
    if (!template) return;

    const newStep: Omit<WorkflowStep, 'id' | 'status' | 'progress'> = {
      name: template.name,
      type: templateType
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));

    setSelectedStepIndex(workflow.steps.length);
  };

  const removeStep = (index: number) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
    
    if (selectedStepIndex === index) {
      setSelectedStepIndex(null);
    }
  };

  const updateStep = (index: number, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { ...step, ...updates } : step
      )
    }));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= workflow.steps.length) return;

    setWorkflow(prev => {
      const newSteps = [...prev.steps];
      [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
      return { ...prev, steps: newSteps };
    });

    setSelectedStepIndex(newIndex);
  };

  const selectedStep = selectedStepIndex !== null ? workflow.steps[selectedStepIndex] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Workflow Canvas */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Designer</CardTitle>
            <CardDescription>Build your blockchain-ANN workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input
                value={workflow.name}
                onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter workflow name..."
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={workflow.description}
                onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your workflow..."
                rows={2}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Workflow Steps</Label>
              
              {workflow.steps.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No steps added yet</p>
                  <p className="text-sm">Add steps from the template panel</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {workflow.steps.map((step, index) => {
                      const template = STEP_TEMPLATES.find(t => t.type === step.type);
                      const Icon = template?.icon || Brain;
                      const isSelected = selectedStepIndex === index;

                      return (
                        <div key={index}>
                          <Card 
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedStepIndex(index)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`p-2 rounded-lg bg-muted ${template?.color}`}>
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">Step {index + 1}</Badge>
                                      <span className="font-semibold">{step.name}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {template?.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveStep(index, 'up');
                                    }}
                                    disabled={index === 0}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveStep(index, 'down');
                                    }}
                                    disabled={index === workflow.steps.length - 1}
                                  >
                                    ↓
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeStep(index);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {index < workflow.steps.length - 1 && (
                            <div className="flex justify-center py-2">
                              <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => onSave(workflow)} 
                variant="outline"
                className="flex-1"
                disabled={workflow.steps.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Workflow
              </Button>
              <Button 
                onClick={() => onExecute(workflow)}
                className="flex-1"
                disabled={workflow.steps.length === 0}
              >
                <Play className="mr-2 h-4 w-4" />
                Execute Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Templates & Configuration */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Step Templates</CardTitle>
            <CardDescription>Add steps to your workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {STEP_TEMPLATES.map((template) => {
                  const Icon = template.icon;
                  return (
                    <Button
                      key={template.type}
                      variant="outline"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => addStep(template.type)}
                    >
                      <div className="flex items-start gap-3 text-left">
                        <div className={`p-2 rounded-lg bg-muted ${template.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {selectedStep && (
          <Card>
            <CardHeader>
              <CardTitle>Step Configuration</CardTitle>
              <CardDescription>Configure selected step</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Step Name</Label>
                <Input
                  value={selectedStep.name}
                  onChange={(e) => updateStep(selectedStepIndex!, { name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Step Type</Label>
                <Select 
                  value={selectedStep.type}
                  onValueChange={(value) => updateStep(selectedStepIndex!, { type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STEP_TEMPLATES.map(template => (
                      <SelectItem key={template.type} value={template.type}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Badge variant="outline">
                  Position: {selectedStepIndex! + 1} of {workflow.steps.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Workflow Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Steps:</span>
                <span className="font-semibold">{workflow.steps.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={workflow.steps.length > 0 ? "default" : "secondary"}>
                  {workflow.steps.length > 0 ? 'Ready' : 'Draft'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
