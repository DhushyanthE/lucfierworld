
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { WalletConnect } from "@/components/wallet/WalletConnect";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: Array<{
    path: string;
    label: string;
    icon: JSX.Element;
  }>;
  isActive: (path: string) => boolean;
  selectedWallet: string | null;
  onConnectWallet: (walletType: string) => void;
}

export const MobileMenu = ({
  isOpen,
  onClose,
  navItems,
  isActive,
  selectedWallet,
  onConnectWallet
}: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-gray-900/95 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
          >
            <Button
              variant={isActive(item.path) ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActive(item.path)
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          </Link>
        ))}
        
        <div className="pt-2 border-t border-gray-800">
          <WalletConnect onConnect={onConnectWallet} selectedWallet={selectedWallet} />
        </div>
      </div>
    </div>
  );
};
