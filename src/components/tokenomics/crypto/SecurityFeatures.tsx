
import React from "react";
import { Shield, Wallet, Globe, Lock } from "lucide-react";

interface SecurityFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface SecurityFeaturesProps {
  features: SecurityFeature[];
  title: string;
}

export function SecurityFeatures({ features, title }: SecurityFeaturesProps) {
  return (
    <div className="bg-gray-800/50 p-5 rounded-lg border border-purple-500/10">
      <h4 className="text-lg font-medium text-purple-400 mb-4">{title}</h4>
      
      <div className="space-y-4">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="flex items-start p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-all duration-300"
          >
            <div className="mr-4 mt-1">{feature.icon}</div>
            <div>
              <h5 className="font-medium text-white">{feature.title}</h5>
              <p className="text-gray-400 text-sm mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
