
import React from "react";
import { Hash, Code, LinkIcon, Key, Shield, Lock, Globe } from "lucide-react";
import { useTranslationContext } from "@/contexts/TranslationContext";

interface WorkflowStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CryptoWorkflowProps {
  steps: WorkflowStep[];
  title: string;
}

export function CryptoWorkflow({ steps, title }: CryptoWorkflowProps) {
  const { t, currentLanguage } = useTranslationContext();
  
  // Get translated icon label based on current step
  const getIconLabel = (index: number) => {
    switch (index) {
      case 0:
        return t('crypto', 'processingData');
      case 1:
        return t('crypto', 'hashingAlgorithm');
      case 2:
        return t('crypto', 'verifyingIntegrity');
      case 3:
        return t('crypto', 'privateKeyStorage');
      default:
        return "";
    }
  };
  
  // Get special styling for Tamil language
  const getStepClasses = (index: number) => {
    if (currentLanguage === 'ta') {
      return "flex items-start p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all duration-300 border-l-2 border-purple-500/50";
    }
    return "flex items-start p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all duration-300";
  };
  
  return (
    <div className="bg-gray-800/50 p-5 rounded-lg border border-purple-500/10">
      <h4 className="text-lg font-medium text-purple-400 mb-4">{title}</h4>
      
      <div className="space-y-1">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            <div className={getStepClasses(index)}>
              <div className="mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-900/50 text-purple-300">
                {step.icon}
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-white">{step.title}</h5>
                <p className="text-gray-400 text-sm mt-1">{step.description}</p>
                
                <div className="flex items-center mt-2 text-xs">
                  <span className="bg-black/30 px-2 py-0.5 rounded text-purple-300 flex items-center">
                    {index === 0 && <Hash className="h-3 w-3 mr-1" />}
                    {index === 1 && <Code className="h-3 w-3 mr-1" />}
                    {index === 2 && <LinkIcon className="h-3 w-3 mr-1" />}
                    {index === 3 && <Key className="h-3 w-3 mr-1" />}
                    {getIconLabel(index)}
                  </span>
                  
                  {/* Security indicators */}
                  {index > 1 && (
                    <span className="ml-2 bg-green-900/30 text-green-400 px-2 py-0.5 rounded flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      {t('security', 'securityScore')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="absolute left-4 top-[3.25rem] h-[calc(100%-0.5rem)] w-0.5 bg-purple-500/20"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t border-purple-500/10 flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center">
          <Globe className="h-3 w-3 mr-1" />
          <span>{t('security', 'languageSupport')}</span>
        </div>
        <div className="flex items-center">
          <Lock className="h-3 w-3 mr-1" />
          <span>{t('security', 'quantumResistant')}</span>
        </div>
      </div>
    </div>
  );
}
