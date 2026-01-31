"use client";

import { useState } from "react";

import Link from "next/link";

import { Info, Maximize2, Send, X, Link2 } from "lucide-react";

import type { Asset } from "@/components/wallet/AssetList";
import { ROUTES } from "@/lib/constants/routes";
import { getAssetIcon } from "@/lib/utils/assetIcons";
import {
  formatCryptoAmount,
  formatCurrency,
  formatUSDValue,
} from "@/lib/utils/format";

interface StealthBalancesCardProps {
  totalBalance: string | number;
  assets: Asset[];
  currency?: string;
  showDemoAlert?: boolean;
}

export function StealthBalancesCard({
  totalBalance,
  assets,
  currency = "USD",
  showDemoAlert = false,
}: StealthBalancesCardProps) {
  const [dismissAlert, setDismissAlert] = useState(false);
  const formattedBalance = formatCurrency(totalBalance, currency);
  const showAlert = showDemoAlert && !dismissAlert;

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-primary bg-card shadow-lg">
      <div className="rounded-t-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-urbanist text-lg font-semibold text-foreground">
              Your Stealth Balances
            </h2>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Info"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Expand"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div>
            <span className="font-urbanist text-3xl font-bold tracking-tight text-foreground">
              {formattedBalance}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">Tokens</p>
        <div className="mt-2 space-y-2">
          {assets.map((asset) => {
            const {
              icon: Icon,
              color,
              bgColor,
              isCustomIcon,
            } = getAssetIcon(asset.symbol, asset.logoURI, asset.name);
            const formattedAmount = formatCryptoAmount(asset.amount);
            const formattedUSD = formatUSDValue(asset.usdValue);
            return (
              <div
                key={asset.symbol}
                className="flex items-center justify-between rounded-xl bg-background/60 py-2.5 px-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${bgColor}`}
                  >
                    {isCustomIcon ? (
                      <Icon className="h-5 w-5" />
                    ) : (
                      <Icon className={`h-5 w-5 ${color}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {formattedAmount} {asset.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {asset.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formattedUSD}
                  </span>
                  <Link
                    href={ROUTES.SEND}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {showAlert && (
          <div className="mt-4 flex items-start gap-3 rounded-xl bg-primary/10 p-3">
            <Link2 className="h-5 w-5 shrink-0 text-primary" />
            <p className="flex-1 text-sm text-foreground">
              Demo Token We&apos;ve sent you this to experience how seamless
              Cypher withdrawals are.{" "}
              <Link
                href={ROUTES.SEND}
                className="font-medium text-primary underline"
              >
                Click me to try it out!
              </Link>
            </p>
            <button
              type="button"
              onClick={() => setDismissAlert(true)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center rounded-b-2xl bg-primary py-3">
        <p className="text-sm font-medium text-primary-foreground">
          Payments received privately through Cypher
        </p>
      </div>
    </div>
  );
}
