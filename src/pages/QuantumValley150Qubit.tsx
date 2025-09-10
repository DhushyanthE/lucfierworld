/**
 * Quantum Valley 150-Qubit Page
 * 
 * Main page component for the comprehensive 150-qubit quantum processing interface.
 */

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { QuantumValleyAdvancedDashboard } from '@/components/quantum/QuantumValleyAdvancedDashboard';

export default function QuantumValley150Qubit() {
  return (
    <AppLayout 
      backgroundEffect="particles"
    >
      <QuantumValleyAdvancedDashboard />
    </AppLayout>
  );
}