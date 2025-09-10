
import React from "react";
import { Globe } from "lucide-react";
import { useTranslationContext } from "@/contexts/TranslationContext";
import { toast } from "sonner";

export function LanguageSelector() {
  const { currentLanguage, setLanguage, getLanguageName } = useTranslationContext();
  
  const handleLanguageChange = (language: string) => {
    setLanguage(language);
    toast.success(`Application language changed to ${getLanguageName(language)}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-10">
      <div className="bg-black/60 border border-purple-500/30 rounded-full p-2 flex items-center gap-1 text-xs text-white">
        <Globe className="h-3 w-3 text-purple-400" />
        <span>{getLanguageName(currentLanguage)}</span>
      </div>
    </div>
  );
}
