
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SecurityFeatures } from '@/components/tokenomics/crypto/SecurityFeatures';
import { WebCryptoDisplay } from '@/components/tokenomics/crypto/WebCryptoDisplay';
import { Shield, Lock, Globe, Zap } from 'lucide-react';
import { QuantumSpecs3D } from './QuantumSpecs3D';

export function TechnicalSpecsOverview() {
  const securityFeatures = [
    {
      title: 'Quantum-Resistant Encryption',
      description: 'Post-quantum cryptographic algorithms resistant to both classical and quantum computing attacks',
      icon: <Shield className="w-5 h-5 text-purple-500" />
    },
    {
      title: 'Multi-Layer Security',
      description: 'Defense-in-depth approach with multiple security layers for enhanced protection',
      icon: <Lock className="w-5 h-5 text-purple-500" />
    },
    {
      title: 'Decentralized Network',
      description: 'Fully distributed architecture with no single point of failure',
      icon: <Globe className="w-5 h-5 text-purple-500" />
    },
    {
      title: 'Real-Time Threat Detection',
      description: 'AI-powered monitoring system that identifies and mitigates threats instantly',
      icon: <Zap className="w-5 h-5 text-purple-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-black/70 border-purple-500/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Quantum Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SecurityFeatures 
              features={securityFeatures}
              title="Security Architecture"
            />
            <div className="space-y-6">
              <WebCryptoDisplay securityLevel={98.2} />
              <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-purple-500/20">
                <CardContent className="p-4">
                  <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-400" />
                    Quantum Security Standards
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
                      <div>
                        <span className="text-white">NIST-compliant</span>
                        <p className="text-gray-400 text-xs mt-0.5">Follows National Institute of Standards and Technology post-quantum guidelines</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Lock className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
                      <div>
                        <span className="text-white">ISO/IEC 27001</span>
                        <p className="text-gray-400 text-xs mt-0.5">Certified information security management system</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Zap className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
                      <div>
                        <span className="text-white">Quantum Key Distribution</span>
                        <p className="text-gray-400 text-xs mt-0.5">Leverages quantum entanglement for secure key exchange</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <QuantumSpecs3D />
        </CardContent>
      </Card>
    </div>
  );
}
