import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, User, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuthButton() {
  const { user, isAuthenticated, loading, signOut } = useAuth();

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm" className="gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50">
          <LogIn className="h-4 w-4" />
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden md:inline-block text-sm font-medium max-w-[120px] truncate">
              {user?.email?.split('@')[0]}
            </span>
            <Badge variant="secondary" className="hidden md:flex bg-green-500/20 text-green-600 border-green-500/30 text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">{user?.email?.split('@')[0]}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/wallet" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            <span>Wallet</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/crypto-market" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            <span>Market Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => signOut()} 
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
