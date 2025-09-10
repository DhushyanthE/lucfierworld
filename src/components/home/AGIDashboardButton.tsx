
import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

export function AGIDashboardButton() {
  return (
    <Link
      to="/agi-dashboard"
      className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-600 
                hover:from-purple-800 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg 
                shadow-lg transition-all duration-300 hover:shadow-purple-500/20 hover:-translate-y-1"
    >
      <BrainCircuit className="h-5 w-5" />
      <span>AGI Dashboard</span>
    </Link>
  );
}
