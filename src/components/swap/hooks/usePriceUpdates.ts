
import { useState, useEffect } from "react";
import exchangeService, { TokenPrice } from "@/services/exchangeService";

export function usePriceUpdates() {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoadingPrices(true);
      const tokenPrices = await exchangeService.getPrices();
      setPrices(tokenPrices);
      setIsLoadingPrices(false);
    };
    
    fetchPrices();
    const intervalId = setInterval(fetchPrices, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return { prices, isLoadingPrices };
}
