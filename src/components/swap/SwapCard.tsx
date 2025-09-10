
import { useSwapLogic } from "./hooks/useSwapLogic";
import { SwapForm } from "./components/SwapForm";
import { AlertCircle } from "lucide-react";

export function SwapCard() {
  const swapLogic = useSwapLogic();
  
  return <SwapForm {...swapLogic} />;
}
