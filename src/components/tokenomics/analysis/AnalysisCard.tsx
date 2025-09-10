
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface AnalysisCardProps {
  title: string;
  children: React.ReactNode;
}

export function AnalysisCard({ title, children }: AnalysisCardProps) {
  return (
    <Card className="p-6 bg-black/70 backdrop-blur-sm border border-purple-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Globe className="h-6 w-6 text-purple-400" /> 
          {title}
        </h3>
      </div>
      {children}
    </Card>
  );
}
