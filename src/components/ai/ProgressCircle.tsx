
import React from 'react';

interface ProgressCircleProps {
  progress: number;
  size: number;
  strokeWidth: number;
  circleColor?: string;
  textColor?: string;
}

export function ProgressCircle({
  progress,
  size,
  strokeWidth,
  circleColor = "#8b5cf6", // Default purple color
  textColor = "#ffffff" // Default white text
}: ProgressCircleProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b" // Dark background for the circle
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={circleColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      
      {/* Percentage text in the center */}
      <div 
        className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
        style={{ color: textColor }}
      >
        {Math.round(normalizedProgress)}%
      </div>
    </div>
  );
}
