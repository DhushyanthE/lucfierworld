
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GenomicSequencingContent } from '@/components/genomics/GenomicSequencingContent';

export default function GenomicSequencing() {
  return (
    <AppLayout>
      <GenomicSequencingContent />
    </AppLayout>
  );
}
