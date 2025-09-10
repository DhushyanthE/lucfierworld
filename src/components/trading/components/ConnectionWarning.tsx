
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConnectionWarningProps {
  message: string;
}

export function ConnectionWarning({ message }: ConnectionWarningProps) {
  return (
    <div className="bg-red-50 border border-red-300/50 rounded-md p-3 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}
