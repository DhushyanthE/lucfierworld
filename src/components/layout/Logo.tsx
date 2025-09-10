
import { Gem, Coins, Diamond, BarChart, Wallet, CoinsIcon, Flame } from "lucide-react";
import { useState } from "react";

export type LogoIconType = "gem" | "coins" | "diamond" | "chart" | "wallet" | "stack" | "flame" | "lion";

interface LogoProps {
  iconType?: LogoIconType;
  size?: number;
  interactive?: boolean;
}

export function Logo({ iconType = "lion", size = 12, interactive = true }: LogoProps) {
  const [currentIcon, setCurrentIcon] = useState<LogoIconType>(iconType);
  
  const icons = {
    gem: <Gem className={`w-${size} h-${size} text-[#8B5CF6]`} />,
    coins: <Coins className={`w-${size} h-${size} text-purple-400`} />,
    diamond: <Diamond className={`w-${size} h-${size} text-purple-400`} />,
    chart: <BarChart className={`w-${size} h-${size} text-purple-400`} />,
    wallet: <Wallet className={`w-${size} h-${size} text-purple-400`} />,
    stack: <CoinsIcon className={`w-${size} h-${size} text-purple-400`} />,
    flame: <Flame className={`w-${size} h-${size} text-purple-400`} />,
    lion: <Gem className={`w-${size} h-${size} text-black`} />
  };
  
  const handleIconChange = () => {
    if (!interactive) return;
    
    const iconTypes: LogoIconType[] = ["lion", "gem", "coins", "diamond", "chart", "wallet", "stack", "flame"];
    const currentIndex = iconTypes.indexOf(currentIcon);
    const nextIndex = (currentIndex + 1) % iconTypes.length;
    setCurrentIcon(iconTypes[nextIndex]);
  };
  
  return (
    <div 
      className={`relative group ${interactive ? 'cursor-pointer' : ''}`}
      onClick={handleIconChange}
    >
      <div className="absolute inset-0 animate-pulse blur-2xl">
        {icons[currentIcon]}
      </div>
      <div className="relative transform group-hover:scale-110 transition-transform duration-300">
        {icons[currentIcon]}
      </div>
    </div>
  );
}
