import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';
import { AuthButton } from '../home/AuthButton';
import { NotificationsCenter } from '../notifications/NotificationsCenter';

export function SimpleNavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Gem className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Quantum Blockchain</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <NotificationsCenter />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
