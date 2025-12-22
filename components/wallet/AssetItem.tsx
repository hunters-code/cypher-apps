import { getAssetIcon } from "@/lib/utils/assetIcons";
import { formatCryptoAmount, formatUSDValue } from "@/lib/utils/format";

interface AssetItemProps {
  symbol: string;
  name: string;
  amount: string;
  usdValue: string;
  onClick?: () => void;
}

export function AssetItem({ symbol, name, amount, usdValue, onClick }: AssetItemProps) {
  const { icon: Icon, color, bgColor, isCustomIcon = false } = getAssetIcon(symbol);
  const formattedAmount = formatCryptoAmount(amount);
  const formattedUSDValue = formatUSDValue(usdValue);

  return (
    <div
      className="border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-full ${bgColor}`}>
            {isCustomIcon ? (
              <Icon className="h-4 w-4" />
            ) : (
              <Icon className={`h-4 w-4 ${color}`} />
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">{name}</span>
            <span className="text-xs text-muted-foreground">{symbol}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-medium">{formattedAmount} {symbol}</span>
          <span className="text-xs text-muted-foreground">{formattedUSDValue}</span>
        </div>
      </div>
    </div>
  );
}

