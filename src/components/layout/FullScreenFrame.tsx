
import React, { ReactNode, useEffect, useState } from 'react';

interface FullScreenFrameProps {
  children: ReactNode;
  backgroundClass?: string;
  withPadding?: boolean;
  animationEffect?: 'particles' | 'waves' | 'grid' | 'none';
}

export function FullScreenFrame({ 
  children, 
  backgroundClass = "bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900", 
  withPadding = true,
  animationEffect = 'none'
}: FullScreenFrameProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    // Animation cleanup on unmount
    return () => {
      setIsLoaded(false);
    };
  }, []);

  return (
    <div className={`min-h-screen ${backgroundClass} relative overflow-hidden`}>
      {/* Animated background effects */}
      {animationEffect === 'particles' && (
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full">
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i}
                className="absolute rounded-full bg-purple-500/20 animate-pulse"
                style={{
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${Math.random() * 8 + 4}s`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {animationEffect === 'waves' && (
        <div className="absolute inset-0 z-0 opacity-20">
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute bottom-0 w-full"
              style={{
                height: `${(i+1) * 150}px`,
                backgroundImage: 'linear-gradient(to top, rgba(139, 92, 246, 0.2), transparent)',
                animation: `wave ${6 + i * 2}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.5}s`,
                transform: 'translateY(50%)',
                opacity: 0.3 - i * 0.1
              }}
            />
          ))}
        </div>
      )}
      
      {animationEffect === 'grid' && (
        <div className="absolute inset-0 z-0 grid grid-cols-12 grid-rows-12 opacity-10">
          {Array.from({ length: 144 }).map((_, i) => (
            <div 
              key={i} 
              className="border border-purple-500/20"
              style={{
                animation: `pulse ${Math.random() * 5 + 3}s ease-in-out infinite alternate`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Content with fade-in animation */}
      <div 
        className={`relative z-10 h-full transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'} ${withPadding ? 'p-4 md:p-6 lg:p-8' : ''}`}
      >
        {children}
      </div>

      {/* CSS for animations using standard style tag */}
      <style>
        {`
        @keyframes wave {
          0% {
            transform: translateY(50%) scaleX(1.0);
          }
          50% {
            transform: translateY(30%) scaleX(1.1);
          }
          100% {
            transform: translateY(50%) scaleX(1.0);
          }
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            opacity: 0.1;
          }
        }
        `}
      </style>
    </div>
  );
}
