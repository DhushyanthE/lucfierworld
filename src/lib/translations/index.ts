
import { languages } from './languages';
import { loadTranslations } from './translationLoader';
import type { 
  TranslationNamespace, 
  CommonTranslationKey,
  CryptoTranslationKey,
  WalletTranslationKey,
  SecurityTranslationKey,
  UITranslationKey,
  NavigationTranslationKey,
  TranslationRecord
} from './types';

// Export types for use in other files
export type {
  TranslationNamespace,
  CommonTranslationKey,
  CryptoTranslationKey,
  WalletTranslationKey,
  SecurityTranslationKey,
  UITranslationKey,
  NavigationTranslationKey,
  TranslationRecord
};

// Export languages array
export { languages };

// Main translation function - gets a translation by namespace and key
export function getTranslationByNamespace(
  language: string, 
  namespace: TranslationNamespace, 
  key: string
): string {
  // Default to English if language not found
  const langCode = getLanguageCode(language) || 'en';
  
  // Get the translations for the requested language and namespace
  const translations = loadTranslations(langCode);
  
  // Try to get the translation
  const translation = translations[namespace]?.[key as any];
  
  // Fall back to English if translation not found
  if (!translation && langCode !== 'en') {
    const englishTranslations = loadTranslations('en');
    return englishTranslations[namespace]?.[key as any] || key;
  }
  
  return translation || key;
}

// Legacy compatibility function
export function getTranslation(language: string, key: CryptoTranslationKey): string {
  return getTranslationByNamespace(language, 'crypto', key);
}

// Helper to get a language code from a language name
export function getLanguageCode(languageNameOrCode: string): string {
  // If it's already a code, return it
  if (languages.find(lang => lang.code === languageNameOrCode)) {
    return languageNameOrCode;
  }
  
  // Otherwise, try to find the code by name
  return languages.find(lang => lang.name === languageNameOrCode)?.code || 'en';
}

// Helper to get a language name from a language code
export function getLanguageName(languageCode: string): string {
  return languages.find(lang => lang.code === languageCode)?.name || 'English';
}

export type LanguageCode = keyof typeof loadTranslations;
