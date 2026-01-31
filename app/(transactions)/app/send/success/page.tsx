"use client";

import { Suspense, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { CheckCircle2, Lock, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { formatCryptoAmount, formatUSDValue } from "@/lib/utils/format";

function SendSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAnimating, setIsAnimating] = useState(true);

  const recipient = searchParams.get("recipient") || "@username";
  const amount = searchParams.get("amount") || "0";
  const token = searchParams.get("token") || "ETH";
  const isPrivate = searchParams.get("private") === "true";
  const usdValue = searchParams.get("usdValue") || "0";
  const txHash = searchParams.get("txHash") || "0x...";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleViewTransaction = () => {
    router.push(ROUTES.HISTORY);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-between gap-6 px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col items-center gap-8 text-center w-full">
        <div className="relative flex items-center justify-center">
          <div
            className={`absolute w-32 h-32 rounded-full bg-primary/20 transition-all duration-700 ${
              isAnimating
                ? "scale-0 opacity-0"
                : "scale-100 opacity-100 animate-pulse"
            }`}
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className={`absolute w-24 h-24 rounded-full bg-primary/40 transition-all duration-600 ${
              isAnimating ? "scale-0 opacity-0" : "scale-100 opacity-100"
            }`}
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className={`relative flex items-center justify-center w-20 h-20 rounded-full bg-primary transition-all duration-500 ${
              isAnimating ? "scale-0 opacity-0" : "scale-100 opacity-100"
            }`}
            style={{ animationDelay: "0.3s" }}
          >
            <CheckCircle2
              className={`h-10 w-10 text-primary-foreground transition-all duration-700 ${
                isAnimating ? "scale-0 rotate-180" : "scale-100 rotate-0"
              }`}
              style={{
                animation: isAnimating
                  ? "none"
                  : "checkmark 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
              }}
            />
          </div>
        </div>

        <div
          className={`flex flex-col gap-2 transition-all duration-500 ${
            isAnimating
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Transaction Successful!
          </h1>
          <p className="text-base text-muted-foreground">
            Your crypto has been sent successfully.
          </p>
        </div>

        <div
          className={`w-full space-y-4 transition-all duration-700 delay-300 ${
            isAnimating
              ? "opacity-0 translate-y-4"
              : "opacity-100 translate-y-0"
          }`}
        >
          <div className="p-4 border rounded-lg space-y-3 bg-card">
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
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">
                Transaction Hash
              </span>
              <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                {txHash}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`flex flex-col gap-4 w-full transition-all duration-700 delay-500 ${
          isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <Button size="lg" className="w-full" onClick={handleViewTransaction}>
          View Transaction
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <style jsx>{`
        @keyframes checkmark {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default function SendSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col items-center justify-center gap-4 px-4 py-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <SendSuccessContent />
    </Suspense>
  );
}
