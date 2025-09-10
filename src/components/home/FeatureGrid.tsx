import React from "react";
import { Card } from "@/components/ui/card";
import { Zap, Shield, Scale, Globe2 } from "lucide-react";

export function FeatureGrid() {
  return (
    <div className="relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-purple-900/5 to-transparent rounded-3xl"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-600/10 rounded-full filter blur-3xl"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard 
          icon={<Zap />} 
          title="Lightning Fast" 
          description="Sub-second finality with 100,000+ TPS capacity, ensuring instant transaction processing even under heavy network load."
          color="blue"
          delay={0.1}
        />
        
        <FeatureCard 
          icon={<Shield />} 
          title="Ultra Secure" 
          description="Post-quantum cryptography with formal verification protocols that ensure resilience against attacks from quantum computers."
          color="purple"
          delay={0.2}
        />
        
        <FeatureCard 
          icon={<Scale />} 
          title="DeFi Ready" 
          description="Advanced smart contracts for complex financial applications with built-in privacy features and cross-chain interoperability."
          color="pink"
          delay={0.3}
        />
        
        <FeatureCard 
          icon={<Globe2 />} 
          title="Global Scale" 
          description="Cross-border payments with instant settlement, enabling frictionless international transactions with minimal fees."
          color="green"
          delay={0.4}
        />
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'purple' | 'pink' | 'green';
  delay: number;
}

function FeatureCard({ icon, title, description, color, delay }: FeatureCardProps) {
  const getGradient = () => {
    switch (color) {
      case 'blue':
        return 'from-blue-900/20 to-blue-800/5';
      case 'purple':
        return 'from-purple-900/20 to-purple-800/5';
      case 'pink':
        return 'from-pink-900/20 to-pink-800/5';
      case 'green':
        return 'from-green-900/20 to-green-800/5';
    }
  };
  
  const getIconColor = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-400 group-hover:text-blue-300';
      case 'purple':
        return 'text-purple-400 group-hover:text-purple-300';
      case 'pink':
        return 'text-pink-400 group-hover:text-pink-300';
      case 'green':
        return 'text-green-400 group-hover:text-green-300';
    }
  };
  
  const getBorderColor = () => {
    switch (color) {
      case 'blue':
        return 'group-hover:border-blue-500/30';
      case 'purple':
        return 'group-hover:border-purple-500/30';
      case 'pink':
        return 'group-hover:border-pink-500/30';
      case 'green':
        return 'group-hover:border-green-500/30';
    }
  };
  
  return (
    <Card className={`group p-6 bg-gradient-to-br ${getGradient()} backdrop-blur-sm border-purple-500/10 ${getBorderColor()} hover:bg-black/60 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden relative animate-fade-in`} 
      style={{ animationDelay: `${delay}s` }}>
      {/* Animated blob */}
      <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-gradient-to-r from-purple-500/5 to-transparent rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>
      
      {/* Animated border glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-shimmer"></div>
      </div>
      
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 ${getIconColor()} bg-black/30 border border-purple-500/20 group-hover:scale-110 transition-all duration-500`}>
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3 group-hover:translate-x-1 transition-transform duration-300">{title}</h3>
      <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-500">{description}</p>
      
      {/* Interactive indicator dot */}
      <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </Card>
  );
}

// Add global styles for the animations
const GlobalStyles = () => (
  <style>
    {`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .animate-shimmer {
        animation: shimmer 3s infinite linear;
      }
      
      @keyframes fade-in {
        0% { opacity: 0; transform: translateY(15px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        opacity: 0;
        animation: fade-in 0.8s ease-out forwards;
      }
    `}
  </style>
);

// Export with the global styles
export function FeatureGridWithStyles() {
  return (
    <>
      <FeatureGrid />
      <GlobalStyles />
    </>
  );
}
