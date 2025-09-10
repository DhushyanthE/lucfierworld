
import React, { ReactNode } from 'react';
import { AppNavigation } from './AppNavigation';
import { FullScreenFrame } from './FullScreenFrame';

interface AppLayoutProps {
  children: ReactNode;
  fullScreen?: boolean;
  backgroundEffect?: 'particles' | 'waves' | 'grid' | 'none';
}

export function AppLayout({ 
  children, 
  fullScreen = false, 
  backgroundEffect = 'none' 
}: AppLayoutProps) {
  return (
    <FullScreenFrame 
      backgroundClass="bg-gradient-to-b from-gray-900 to-black" 
      withPadding={false}
      animationEffect={backgroundEffect}
    >
      <AppNavigation />
      <main className={`${fullScreen ? 'pb-0' : 'pb-16'}`}>
        {children}
      </main>
    </FullScreenFrame>
  );
}
