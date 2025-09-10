
import React from 'react';
import Layout from '@/components/Layout';
import { QuantumCircuitStudio } from '@/components/quantum/advanced/QuantumCircuitStudio';

export default function QuantumCircuits() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <QuantumCircuitStudio />
      </div>
    </Layout>
  );
}
