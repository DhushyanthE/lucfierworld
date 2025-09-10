
import { useState, useCallback, useEffect } from 'react';
import { 
  TranslationNamespace,
  getTranslationByNamespace, 
  getLanguageCode, 
  getLanguageName 
} from '@/lib/translations/index';
import { toast } from 'sonner';

export type TranslationResult = {
  t: (namespace: TranslationNamespace, key: string) => string;
  currentLanguage: string;
  setLanguage: (language: string) => void;
  getLanguageName: (code: string) => string;
  getLanguageCode: (name: string) => string;
  isLoading: boolean;
  error: Error | null;
};

export function useTranslation(initialLanguage: string = 'en'): TranslationResult {
  const [currentLanguage, setCurrentLanguage] = useState<string>(initialLanguage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    try {
      const savedLanguage = localStorage.getItem('app-language');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load language preference'));
      toast.error('Failed to load language preference');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = useCallback((language: string) => {
    try {
      setCurrentLanguage(language);
      localStorage.setItem('app-language', language);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to set language'));
      toast.error('Failed to save language preference');
    }
  }, []);

  const t = useCallback(
    (namespace: TranslationNamespace, key: string): string => {
      try {
        return getTranslationByNamespace(currentLanguage, namespace, key);
      } catch (err) {
        console.error('Translation error:', err);
        return key;
      }
    },
    [currentLanguage]
  );

  return { 
    t,
    currentLanguage,
    setLanguage,
    getLanguageName,
    getLanguageCode,
    isLoading,
    error
  };
}
