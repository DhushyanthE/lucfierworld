
import React, { useRef } from "react";
import { ParticleBackground } from "./ParticleBackground";
import { GlowEffects } from "./GlowEffects";
import { HeroHeading } from "./HeroHeading";
import { HeroDescription } from "./HeroDescription";
import { ActionButtons } from "./ActionButtons";
import { StatsIndicators } from "./StatsIndicators";
import { AnimationStyles } from "./AnimationStyles";

interface HeroSectionProps {
  onTrySwap: () => void;
}

export function HeroSection({ onTrySwap }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="relative max-w-4xl mb-24">
      {/* Particle canvas background */}
      <ParticleBackground containerRef={containerRef} />
      
      {/* Glowing background effects */}
      <GlowEffects />
      
      {/* Main content */}
      <HeroHeading />
      <HeroDescription />
      <ActionButtons onTrySwap={onTrySwap} />
      
      {/* Stats indicators */}
      <StatsIndicators />
      
      {/* Animation styles */}
      <AnimationStyles />
    </div>
  );
}
