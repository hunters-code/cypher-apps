"use client";

import { Button } from "@/components/ui/button";

import { AssetItem } from "./AssetItem";

export interface Asset {
  symbol: string;
  name: string;
  amount: string;
  usdValue: string;
}

interface AssetListProps {
  assets: Asset[];
  onAssetClick?: (asset: Asset) => void;
  onAddClick?: () => void;
}

export function AssetList({
  assets,
  onAssetClick,
  onAddClick,
}: AssetListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Assets</h2>
        {onAddClick && (
          <Button variant="ghost" size="sm" onClick={onAddClick}>
            + Add
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        {assets.map((asset) => (
          <AssetItem
            key={asset.symbol}
            symbol={asset.symbol}
            name={asset.name}
            amount={asset.amount}
            usdValue={asset.usdValue}
            onClick={() => onAssetClick?.(asset)}
          />
        ))}
      </div>
    </div>
  );
}
