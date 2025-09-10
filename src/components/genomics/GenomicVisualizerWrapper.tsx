
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GenomicDataVisualizer } from './GenomicDataVisualizer';

export function GenomicVisualizerWrapper() {
  return (
    <Card>
      <CardContent className="pt-6">
        <GenomicDataVisualizer />
      </CardContent>
    </Card>
  );
}
