
import React from 'react';
import { useTranslationContext } from '@/contexts/TranslationContext';
import { languages } from '@/lib/translations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

export function TranslationExample() {
  const { t, currentLanguage, setLanguage } = useTranslationContext();
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto bg-black/70 backdrop-blur-sm border border-purple-500/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Globe className="h-5 w-5 text-purple-400" />
          {t('ui', 'multilingual')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Select value={currentLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full bg-black/40 border-purple-500/30 text-white">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border border-purple-500/30 text-white">
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-purple-400 font-medium">{t('crypto', 'cryptoTechnologies')}</h3>
          <p className="text-gray-300 text-sm">{t('crypto', 'encryptDescription')}</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-purple-400 font-medium">{t('wallet', 'walletIntegration')}</h3>
          <p className="text-gray-300 text-sm">{t('security', 'quantumResistant')}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm">
            {t('common', 'confirm')}
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md text-sm">
            {t('common', 'cancel')}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
