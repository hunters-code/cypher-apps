import { ComponentType } from "react";

import { Coins, DollarSign, LucideIcon } from "lucide-react";

function FirstLetterIcon({
  letter,
  className,
}: {
  letter: string;
  className?: string;
}) {
  return (
    <span className={`text-xs font-semibold text-foreground ${className}`}>
      {letter}
    </span>
  );
}

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
  CDT: {
    icon: DollarSign,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    isCustomIcon: false,
  },
};

export function getAssetIcon(
  symbol: string,
  logoURI?: string,
  name?: string
): AssetIconConfig {
  const upperSymbol = symbol.toUpperCase();

  if (!logoURI && name) {
    const firstLetter = name.split(" ")[0].charAt(0).toUpperCase();
    return {
      icon: ({ className }: { className?: string }) => (
        <FirstLetterIcon letter={firstLetter} className={className} />
      ),
      color: "text-foreground",
      bgColor: "bg-muted/20",
      isCustomIcon: true,
    };
  }

  return (
    assetIconsMap[upperSymbol] || {
      icon: Coins,
      color: "text-muted-foreground",
      bgColor: "bg-muted/10",
    }
  );
}

export { assetIconsMap };
