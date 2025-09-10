
import React, { useState } from "react";
import { Check, ChevronsUpDown, Globe, RefreshCw, Server, Binary } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { languages } from "@/lib/translations";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  multiLangTitle: string;
}

interface ProcessingState {
  state: 'idle' | 'processing' | 'complete';
  step: number;
  status: string | null;
}

export function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange, 
  multiLangTitle 
}: LanguageSelectorProps) {
  const [processing, setProcessing] = useState<ProcessingState>({
    state: 'idle',
    step: 0,
    status: null
  });
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (language: string) => {
    setProcessing({
      state: 'processing',
      step: 0,
      status: null
    });
    
    // Simulate backend language processing
    simulateBackendLanguageProcessing(language);
    
    onLanguageChange(language);
    toast.success(`Application language changed to ${languages.find(lang => lang.code === language)?.name || language}`);
    setOpen(false);
  };
  
  // Simulate backend processing when language changes
  const simulateBackendLanguageProcessing = async (language: string) => {
    // Step 1: Input processing
    setProcessing({
      state: 'processing',
      step: 1,
      status: "Initializing language context..."
    });
    await simulateProcessingDelay(800);
    
    // Step 2: Security verification
    setProcessing({
      state: 'processing',
      step: 2,
      status: "Verifying integrity with crypto.subtle..."
    });
    
    try {
      // Use actual Web Crypto API for demonstration
      const encoder = new TextEncoder();
      const data = encoder.encode(`language-change-${language}-${Date.now()}`);
      await crypto.subtle.digest('SHA-256', data);
    } catch (error) {
      console.error("Crypto API error:", error);
    }
    
    await simulateProcessingDelay(1000);
    
    // Step 3: Database update (simulated)
    setProcessing({
      state: 'processing',
      step: 3,
      status: "Updating language preferences..."
    });
    await simulateProcessingDelay(700);
    
    // Complete
    setProcessing({
      state: 'complete',
      step: 4,
      status: `${languages.find(lang => lang.code === language)?.name || language} language applied successfully`
    });
    await simulateProcessingDelay(500);
    
    // Reset after showing completion
    setTimeout(() => {
      setProcessing({
        state: 'idle',
        step: 0,
        status: null
      });
    }, 3000);
  };
  
  const simulateProcessingDelay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // Modern Language Selector with Command menu
  const renderModernLanguageSelector = () => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className="w-full bg-black/40 border-purple-500/30 text-white justify-between"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {languages.find(lang => lang.code === selectedLanguage)?.name || "English"}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-gray-900 border border-purple-500/30 text-white">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem 
                  key={language.code} 
                  value={language.name} 
                  onSelect={() => handleLanguageChange(language.code)}
                  className="hover:bg-purple-900/30"
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedLanguage === language.code ? "opacity-100" : "opacity-0")}
                  />
                  {language.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  return (
    <div>
      <h4 className="text-lg font-medium text-purple-400 mb-4 flex items-center">
        <Globe className="h-5 w-5 mr-2" />
        {multiLangTitle}
      </h4>
      
      <div className="mb-4">
        {renderModernLanguageSelector()}
      </div>
      
      {processing.state !== 'idle' && (
        <div className="bg-black/40 p-3 rounded-lg border border-purple-500/20 mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300 flex items-center">
              <Server className="h-3 w-3 mr-1" /> 
              Backend Processing
            </span>
            {processing.state === 'processing' ? (
              <span className="text-xs bg-yellow-500/80 text-black px-2 py-0.5 rounded-full flex items-center">
                <RefreshCw className="h-2 w-2 mr-1 animate-spin" /> Processing
              </span>
            ) : (
              <span className="text-xs bg-green-500/80 text-black px-2 py-0.5 rounded-full flex items-center">
                <RefreshCw className="h-2 w-2 mr-1" /> Complete
              </span>
            )}
          </div>
          
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-500"
              style={{ width: `${processing.step * 25}%` }}
            ></div>
          </div>
          
          {processing.status && (
            <div className="mt-2 text-xs text-gray-400 font-mono">
              <Binary className="h-3 w-3 inline mr-1 text-purple-400" />
              {processing.status}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
