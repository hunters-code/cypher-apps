import { ComponentType } from "react";

import { Coins, DollarSign, LucideIcon } from "lucide-react";

import { BTCIcon } from "@/components/icons/BTCIcon";
import { ETHIcon } from "@/components/icons/ETHIcon";
import { USDCIcon } from "@/components/icons/USDCIcon";
import { USDTIcon } from "@/components/icons/USDTIcon";

interface AssetIconConfig {
  icon: LucideIcon | ComponentType<{ className?: string }>;
  color?: string;
  bgColor?: string;
  isCustomIcon?: boolean;
}

const assetIconsMap: Record<string, AssetIconConfig> = {
  ETH: {
    icon: ETHIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    isCustomIcon: true,
  },
  BTC: {
    icon: BTCIcon,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    isCustomIcon: true,
  },
  USDC: {
    icon: USDCIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    isCustomIcon: true,
  },
  USDT: {
    icon: USDTIcon,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    isCustomIcon: true,
  },
  DAI: {
    icon: DollarSign,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    isCustomIcon: false,
  },
};

export function getAssetIcon(symbol: string): AssetIconConfig {
  const upperSymbol = symbol.toUpperCase();
  return (
    assetIconsMap[upperSymbol] || {
      icon: Coins,
      color: "text-muted-foreground",
      bgColor: "bg-muted/10",
    }
  );
}

export { assetIconsMap };
