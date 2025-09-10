
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface WalletItemProps {
  name: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}

const WalletItem: React.FC<WalletItemProps> = ({
  name,
  icon,
  onClick,
  disabled = false,
  tooltip
}) => {
  const walletButton = (
    <Button
      variant="outline"
      className={`w-full justify-start border border-purple-500/30 bg-gray-900/50 text-white hover:bg-purple-900/20 hover:text-purple-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className="flex items-center w-full">
        <div className="flex-shrink-0 h-8 w-8 mr-3">
          <img src={icon} alt={name} className="h-full w-full object-contain" />
        </div>
        <span className="text-base">{name}</span>
        {disabled && tooltip && (
          <span className="ml-auto text-xs text-gray-400">{tooltip}</span>
        )}
      </div>
    </Button>
  );

  if (disabled && tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{walletButton}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return walletButton;
};

export default WalletItem;
