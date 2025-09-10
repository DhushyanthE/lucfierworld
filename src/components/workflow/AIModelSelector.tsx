
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AIModelType } from '@/types';

// Model data with descriptions and capabilities
const MODEL_DATA = {
  gpt: {
    name: 'OpenAI GPT',
    description: 'Advanced natural language processing with strong reasoning capabilities',
    capabilities: ['Text generation', 'Data analysis', 'Code generation'],
    icon: '🧠'
  },
  claude: {
    name: 'Claude',
    description: 'Anthropic\'s assistant with robust text analysis and summarization',
    capabilities: ['Long context processing', 'Document analysis', 'Summarization'],
    icon: '🔮'
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Multimodal AI with advanced reasoning and quantum capabilities',
    capabilities: ['Image understanding', 'Quantum optimization', 'Scientific research'],
    icon: '✨'
  },
  deepseek: {
    name: 'DeepSeek',
    description: 'Specialized in complex technical and scientific tasks',
    capabilities: ['Technical analysis', 'Research assistance', 'Code optimization'],
    icon: '⚡'
  }
};

interface AIModelSelectorProps {
  activeModel: AIModelType;
  onModelChange: (model: AIModelType) => void;
  disabled?: boolean;
  showDescription?: boolean;
}

export function AIModelSelector({
  activeModel,
  onModelChange,
  disabled = false,
  showDescription = true
}: AIModelSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium text-gray-200">AI Model</Label>
      </div>
      
      <RadioGroup
        value={activeModel}
        onValueChange={(value) => onModelChange(value as AIModelType)}
        className="grid grid-cols-2 gap-2"
        disabled={disabled}
      >
        {(Object.keys(MODEL_DATA) as AIModelType[]).map((model) => (
          <div key={model} className="relative">
            <RadioGroupItem
              value={model}
              id={`model-${model}`}
              className="peer sr-only"
              disabled={disabled}
            />
            <Label
              htmlFor={`model-${model}`}
              className={`flex flex-col h-full space-y-1 rounded-md border p-3 
                hover:bg-gray-800/40 transition-colors 
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} 
                peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-900/20`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{MODEL_DATA[model].icon} {MODEL_DATA[model].name}</span>
                {activeModel === model && (
                  <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                )}
              </div>
              
              {showDescription && (
                <>
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {MODEL_DATA[model].description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {MODEL_DATA[model].capabilities.slice(0, 2).map((capability, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-gray-800/60 px-1.5 py-0.5 rounded-sm"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
