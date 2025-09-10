
import React from "react";

export function GlowEffects() {
  return (
    <>
      {/* Glowing orb accents */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600/30 rounded-full filter blur-3xl opacity-50 animate-pulse" />
      <div className="absolute top-1/2 -right-20 w-60 h-60 bg-blue-600/20 rounded-full filter blur-3xl opacity-40 animate-pulse" style={{animationDuration: '7s'}} />
    </>
  );
}
