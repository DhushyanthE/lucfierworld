
import React from "react";
import { cn } from "@/lib/utils";
import { useTranslationContext } from "@/contexts/TranslationContext";
import { Shield, Lock, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SecurityLevelIndicatorProps {
  level: number;
}

export function SecurityLevelIndicator({ level }: SecurityLevelIndicatorProps) {
  const { t, currentLanguage } = useTranslationContext();
  
  // Normalize level to be between 0 and 10
  const normalizedLevel = Math.max(0, Math.min(10, level));

  // Calculate color based on level
  const getColor = () => {
    if (normalizedLevel < 3) return "bg-red-500";
    if (normalizedLevel < 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Get text description based on level
  const getDescription = () => {
    if (normalizedLevel < 3) return t('common', 'low');
    if (normalizedLevel < 7) return t('common', 'medium');
    return t('common', 'high');
  };

  // Get security features based on level
  const getSecurityFeatures = () => {
    const features = [];
    
    if (normalizedLevel >= 3) {
      features.push(t('crypto', 'hashingAlgorithm'));
    }
    if (normalizedLevel >= 5) {
      features.push(t('crypto', 'signatureVerification'));
    }
    if (normalizedLevel >= 7) {
      features.push(t('security', 'multiLayerSecurity'));
    }
    if (normalizedLevel >= 9) {
      features.push(t('crypto', 'aiCryptoShield'));
    }
    
    return features;
  };

  // Get custom Tamil styling
  const getProgressBarClasses = () => {
    if (currentLanguage === 'ta') {
      return cn("h-full rounded-full transition-all duration-700", getColor(), "shadow-lg shadow-purple-500/20");
    }
    return cn("h-full rounded-full transition-all duration-700", getColor());
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="flex items-center">
          <Shield className="h-3 w-3 mr-1 text-purple-400" />
          {t('crypto', 'securityLevel')}
        </span>
        <span
          className={cn(
            "font-medium",
            normalizedLevel < 3 ? "text-red-500" : normalizedLevel < 7 ? "text-yellow-500" : "text-green-500",
          )}
        >
          {getDescription()} ({normalizedLevel}/10)
        </span>
      </div>

      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={getProgressBarClasses()} 
          style={{ width: `${normalizedLevel * 10}%` }} 
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{t('common', 'low')}</span>
        <span>{t('common', 'medium')}</span>
        <span>{t('common', 'high')}</span>
      </div>
      
      <div className="mt-3 space-y-2">
        {getSecurityFeatures().map((feature, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-xs text-gray-300 hover:text-white transition-colors">
                  {index === getSecurityFeatures().length - 1 ? (
                    <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                  ) : (
                    <Info className="h-3 w-3 mr-1 text-blue-400" />
                  )}
                  <span>{feature}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border border-purple-500/30 text-white">
                <p>{t('security', 'securityFeatures')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      
      {normalizedLevel >= 8 && (
        <div className="mt-1 flex items-center justify-end text-xs text-green-400">
          <Lock className="h-3 w-3 mr-1" />
          <span>{t('security', 'quantumResistant')}</span>
        </div>
      )}
      
      {normalizedLevel < 5 && (
        <div className="mt-1 flex items-center justify-end text-xs text-yellow-400">
          <AlertTriangle className="h-3 w-3 mr-1" />
          <span>{t('security', 'riskAssessment')}</span>
        </div>
      )}
    </div>
  );
}
