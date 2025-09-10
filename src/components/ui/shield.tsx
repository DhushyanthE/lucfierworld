
import React from 'react';

interface ShieldProps {
  children?: React.ReactNode;
  className?: string;
  size?: number;
  color?: string;
}

export function Shield({ children, className = '', size = 24, color = 'currentColor' }: ShieldProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {children}
    </svg>
  );
}
