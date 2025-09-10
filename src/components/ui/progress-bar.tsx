
import React from 'react';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  className?: string;
  background?: string;
}

export function ProgressBar({ value, max, className, background = 'bg-black', ...props }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  
  return (
    <div className={`w-full h-2 rounded-full overflow-hidden ${background}`} {...props}>
      <div 
        className={`h-full ${className || 'bg-blue-500'} transition-all duration-300 ease-out`}
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}
