
import React from 'react';
import { Button } from "@/components/ui/button";
import { Globe, Loader } from "lucide-react";
import { languages } from '@/lib/translations/index';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface LanguagePickerProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  showSelector: boolean;
  onToggleSelector: () => void;
  isLoading?: boolean;
}

export function LanguagePicker({ 
  currentLanguage, 
  onLanguageChange, 
  showSelector,
  onToggleSelector,
  isLoading
}: LanguagePickerProps) {
  if (isLoading) {
    return <LoadingSpinner size="sm" />;
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm"
        className="text-xs flex items-center gap-1 text-gray-400 hover:text-white p-1"
        onClick={onToggleSelector}
      >
        <Globe className="h-3 w-3" />
      </Button>
      
      {showSelector && (
        <div className="absolute right-4 top-12 bg-gray-800 rounded-md shadow-lg p-2 z-10 max-h-40 overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`block w-full text-left px-3 py-1 text-sm rounded-sm ${
                currentLanguage === lang.code ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => onLanguageChange(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
