
import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation, TranslationResult } from '@/hooks/useTranslation';

// Create the context
const TranslationContext = createContext<TranslationResult | undefined>(undefined);

// Props for the provider
interface TranslationProviderProps {
  children: ReactNode;
  initialLanguage?: string;
}

// Provider component
export function TranslationProvider({ 
  children, 
  initialLanguage = 'en' 
}: TranslationProviderProps) {
  const translation = useTranslation(initialLanguage);
  
  return (
    <TranslationContext.Provider value={translation}>
      {children}
    </TranslationContext.Provider>
  );
}

// Hook for consuming the context
export function useTranslationContext(): TranslationResult {
  const context = useContext(TranslationContext);
  
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  
  return context;
}
