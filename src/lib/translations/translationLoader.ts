
import { enTranslations } from './languages/en';
import { esTranslations } from './languages/es';
import { taTranslations } from './languages/ta';
import type { TranslationRecord } from './types';

// Store translations in memory to avoid reloading
const translationCache: Record<string, Partial<TranslationRecord>> = {
  en: enTranslations as Partial<TranslationRecord>,
  es: esTranslations as Partial<TranslationRecord>,
  ta: taTranslations as Partial<TranslationRecord>,
  // Add more languages as they're imported
};

// Function to load translations for a specific language
export function loadTranslations(language: string): Partial<TranslationRecord> {
  // Return cached translations if available
  if (translationCache[language]) {
    return translationCache[language];
  }
  
  // If not available, return English as fallback
  return translationCache.en;
}

// For dynamic loading in the future, we could add lazy-loading capabilities here
