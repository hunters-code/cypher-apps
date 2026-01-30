"use client";

import { Suspense, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Lock, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBaseProvider } from "@/hooks/useBlockchain";
import { useWallet } from "@/hooks/useWallet";
import {
  getViewingKey,
  getAddress,
  generateStealthAddress,
  announceStealthTransaction,
} from "@/lib/blockchain";
import { BASE_TOKENS, sendToken } from "@/lib/blockchain/tokens";
import { ROUTES } from "@/lib/constants/routes";
import { formatCryptoAmount, formatUSDValue } from "@/lib/utils/format";

function SendConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = useBaseProvider();
  const { signer } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const recipient = searchParams.get("recipient") || "@username";
  const amount = searchParams.get("amount") || "0";
  const token = searchParams.get("token") || "ETH";
  const isPrivate = searchParams.get("private") === "true";
  const usdValue = searchParams.get("usdValue") || "0";
  const fee = searchParams.get("fee") || "0.0002";
  const feeUSD = searchParams.get("feeUSD") || "0.36";

  // Get token info
  const tokenInfo = BASE_TOKENS[token];
  // const isNativeToken = !tokenInfo || tokenInfo.address === "native";

  const handleConfirm = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (!provider) {
        throw new Error("Provider not available");
      }

      if (!signer) {
        throw new Error("Please connect your wallet");
      }

      let stealthAddress: string | null = null;
      let ephemeralPublicKey: string | null = null;
      let txHash: string;

      // If private mode, generate stealth address
      if (isPrivate && recipient.startsWith("@")) {
        const cleanRecipient = recipient.replace(/^@+/, "");

        // Get recipient's viewing key
        const viewingKey = await getViewingKey(provider, cleanRecipient);

        // Generate stealth address
        const stealthResult = generateStealthAddress(viewingKey);
        stealthAddress = stealthResult.stealthAddress;
        ephemeralPublicKey = stealthResult.ephemeralPublicKey;

        // Send token to stealth address
        const receipt = await sendToken(
          signer,
          tokenInfo,
          stealthAddress,
          amount
        );

        if (!receipt) {
          throw new Error("Transaction failed");
        }

        txHash = receipt.hash;

        // Announce the stealth transaction (optional, non-blocking)
        try {
          await announceStealthTransaction(
            signer,
            stealthAddress,
            ephemeralPublicKey,
            {
              amount,
              tokenSymbol: token,
              message: `Private transfer to ${recipient}`,
            }
          );
        } catch (announcementError) {
          console.warn(
            "Failed to announce stealth transaction:",
            announcementError
          );
          // Continue anyway - the transfer already succeeded
        }
      } else {
        // Regular transfer (public)
        let toAddress: string;

        if (recipient.startsWith("0x")) {
          toAddress = recipient;
        } else {
          const cleanRecipient = recipient.replace(/^@+/, "");
          toAddress = await getAddress(provider, cleanRecipient);
        }

        // Send token
        const receipt = await sendToken(signer, tokenInfo, toAddress, amount);

        if (!receipt) {
          throw new Error("Transaction failed");
        }

        txHash = receipt.hash;
      }

      const params = new URLSearchParams({
        recipient,
        amount,
        token,
        private: isPrivate.toString(),
        usdValue,
        txHash,
        ...(stealthAddress && { stealthAddress }),
      });

      router.push(`${ROUTES.SEND_SUCCESS}?${params.toString()}`);
    } catch (err) {
      console.error("Transaction failed:", err);
      if (err instanceof Error) {
        if (err.message.includes("user rejected")) {
          setError("Transaction cancelled");
        } else if (err.message.includes("insufficient funds")) {
          setError("Insufficient balance for transaction");
        } else {
          setError(err.message || "Transaction failed. Please try again.");
        }
      } else {
        setError("Transaction failed. Please try again.");
      }
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
              <span className="text-sm font-medium">
                {formatUSDValue(usdValue)}
              </span>
            </div>
            {isPrivate && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Privacy Mode
                  </span>
                </div>
                <span className="text-sm font-medium text-primary">
                  Enabled
                </span>
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
                {formatCryptoAmount(parseFloat(amount) + parseFloat(fee))}{" "}
                {token}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
              <p className="text-sm text-destructive text-center">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <Button className="w-full" onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Confirm Send
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleBack}
          disabled={isLoading}
        >
          Back
        </Button>
      </div>
    </div>
  );
}

export default function SendConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center gap-4 h-full w-full py-16 px-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <SendConfirmContent />
    </Suspense>
  );
}
