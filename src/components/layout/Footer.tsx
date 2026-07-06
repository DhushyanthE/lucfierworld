import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/layout/Logo";

export const Footer: React.FC = () => {
  return (
    <footer className="py-12 bg-black/40">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Logo iconType="lion" interactive={false} />
            <span className="text-white font-medium">Quantum Coin</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/connect" className="text-purple-300 hover:text-purple-200">
              Connect an AI assistant
            </Link>
            <span className="text-gray-400">
              © 2025 Quantum Coin. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
