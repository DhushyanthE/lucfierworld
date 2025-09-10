
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, ChevronRight, CircleDollarSign, Cpu, Dna, LayoutGrid, Network } from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  isNew?: boolean;
}

export function AppNavigation() {
  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/quantum',
      icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
      label: 'AGI Workflow',
      href: '/quantum-workflow',
      icon: <Brain className="h-5 w-5" />,
    },
    {
      label: 'Quantum Coin',
      href: '/quantum-ai',
      icon: <CircleDollarSign className="h-5 w-5" />,
    },
    {
      label: 'Blockchain Network',
      href: '/blockchain',
      icon: <Network className="h-5 w-5" />,
    },
    {
      label: 'Quantum Computing',
      href: '/quantum-computing',
      icon: <Cpu className="h-5 w-5" />,
    },
    {
      label: 'Genomic Sequencing',
      href: '/genomic',
      icon: <Dna className="h-5 w-5" />,
      isNew: true,
    },
  ];

  return (
    <nav className="flex flex-col space-y-1">
      {navigationItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) => 
            `flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
              isActive
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
          }
        >
          <div className="flex items-center gap-3">
            <span className="text-purple-400">{item.icon}</span>
            <span>{item.label}</span>
            {item.isNew && (
              <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded-sm">
                New
              </span>
            )}
          </div>
          <ChevronRight className="h-4 w-4" />
        </NavLink>
      ))}
    </nav>
  );
}

export default AppNavigation;
