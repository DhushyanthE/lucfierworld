
import React from "react";
import { Logo } from "@/components/layout/Logo";

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 bg-black/40">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Logo iconType="lion" interactive={false} />
            <span className="text-white font-medium">Quantum Coin</span>
          </div>
          <div className="text-gray-400">
            © 2025 Quantum Coin. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
