"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import { formatCryptoAmount, formatUSDValue } from "@/lib/utils/format";

export default function SendConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const recipient = searchParams.get("recipient") || "@username";
  const amount = searchParams.get("amount") || "0";
  const token = searchParams.get("token") || "ETH";
  const isPrivate = searchParams.get("private") === "true";
  const usdValue = searchParams.get("usdValue") || "0";
  const fee = searchParams.get("fee") || "0.0002";
  const feeUSD = searchParams.get("feeUSD") || "0.36";

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const params = new URLSearchParams({
        recipient,
        amount,
        token,
        private: isPrivate.toString(),
        usdValue,
        txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`,
      });

      router.push(`/send/success?${params.toString()}`);
    } catch (err) {
      console.error("Transaction failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col justify-between items-center gap-4 h-full w-full py-16 px-8">
      <div className="flex flex-col items-center gap-8 text-center w-full">
        <h1 className="text-3xl font-bold text-foreground text-left w-full">
          Confirm Transaction
        </h1>
        <p className="text-base text-muted-foreground text-left w-full">
          Review your transaction details before confirming.
        </p>

        <div className="space-y-4 w-full">
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">To</span>
              <span className="text-sm font-medium">{recipient}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-sm font-medium">
                {formatCryptoAmount(amount)} {token}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">USD Value</span>
              <span className="text-sm font-medium">{formatUSDValue(usdValue)}</span>
            </div>
            {isPrivate && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Privacy Mode</span>
                </div>
                <span className="text-sm font-medium text-primary">Enabled</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Network Fee</span>
              <span className="text-xs font-medium">
                ~{formatCryptoAmount(fee)} {token} ({formatUSDValue(feeUSD)})
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-sm font-medium">Total</span>
              <span className="text-sm font-bold">
                {formatCryptoAmount(parseFloat(amount) + parseFloat(fee))} {token}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <Button
          className="w-full"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              Confirm Send
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        <Button variant="secondary" className="w-full" onClick={handleBack} disabled={isLoading}>
          Back
        </Button>
      </div>
    </div>
  );
}

