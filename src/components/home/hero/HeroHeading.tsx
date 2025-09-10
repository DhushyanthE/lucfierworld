
import React from "react";

export function HeroHeading() {
  return (
    <h1 className="text-6xl font-bold text-white mb-8 leading-tight animate-fade-in relative">
      Quantum-Secured
      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 animate-gradient">
        Financial Revolution
      </span>
      <div className="absolute -z-10 top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent"></div>
    </h1>
  );
}
