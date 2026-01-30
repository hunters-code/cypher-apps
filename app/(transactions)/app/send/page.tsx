"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";
import { QrCode, Lock, Loader2, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBaseProvider } from "@/hooks/useBlockchain";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useUsername } from "@/hooks/useUsername";
// import { getAddress } from "@/lib/blockchain";
import { ROUTES } from "@/lib/constants/routes";
import { hasSession } from "@/lib/utils/session";

export default function SendPage() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const provider = useBaseProvider();
  const { checkAvailability, isChecking } = useUsername();
  const { balances, isLoading: isLoadingBalances } = useTokenBalances(["CDT"]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [token] = useState("CDT");
  const [isValidatingRecipient, setIsValidatingRecipient] = useState(false);
  const [recipientValid, setRecipientValid] = useState<boolean | null>(null);
  const [recipientError, setRecipientError] = useState("");
  const [balanceError, setBalanceError] = useState("");

  // Get CDT balance
  const cdtBalance = balances.find((b) => b.symbol === "CDT");
  const currentBalance = cdtBalance ? parseFloat(cdtBalance.amount) : 0;

  // Validate recipient (username or address)
  useEffect(() => {
    if (!recipient.trim() || !provider) {
      setRecipientValid(null);
      setRecipientError("");
      return;
    }

    const validateRecipient = async () => {
      setIsValidatingRecipient(true);
      setRecipientError("");

      try {
        const cleanRecipient = recipient.replace(/^@+/, "");

        // Check if it's a valid Ethereum address
        if (recipient.startsWith("0x") && recipient.length === 42) {
          setRecipientValid(true);
          setIsValidatingRecipient(false);
          return;
        }

        // Check if username is available (meaning it does NOT exist)
        // For sending, we want the username to be TAKEN (not available)
        const isAvailable = await checkAvailability(cleanRecipient);

        if (isAvailable === false) {
          // Username is taken (registered), which is what we want for sending
          setRecipientValid(true);
          setRecipientError("");
        } else if (isAvailable === true) {
          // Username is available (not registered), cannot send to it
          setRecipientValid(false);
          setRecipientError("Username not found");
        } else {
          // Error or null result
          setRecipientValid(false);
          setRecipientError("Could not verify username");
        }
      } catch {
        setRecipientValid(false);
        setRecipientError("Invalid recipient");
      } finally {
        setIsValidatingRecipient(false);
      }
    };

    const timeoutId = setTimeout(validateRecipient, 500);
    return () => clearTimeout(timeoutId);
  }, [recipient, provider, checkAvailability]);

  // Validate amount against balance
  useEffect(() => {
    if (!amount.trim()) {
      setBalanceError("");
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setBalanceError("Invalid amount");
      return;
    }

    if (amountValue > currentBalance) {
      setBalanceError("Insufficient balance");
      return;
    }

    setBalanceError("");
  }, [amount, currentBalance]);

  const handleContinue = () => {
    if (!recipient.trim() || !amount.trim()) {
      return;
    }

    if (recipientValid === false || isValidatingRecipient) {
      return;
    }

    if (balanceError) {
      return;
    }

    const usdValue = (parseFloat(amount) * 1790).toFixed(2);
    const params = new URLSearchParams({
      recipient: recipient.startsWith("@")
        ? recipient
        : recipient.startsWith("0x")
          ? recipient
          : `@${recipient}`,
      amount,
      token,
      private: isPrivate.toString(),
      usdValue,
      fee: "0.0002",
      feeUSD: "0.36",
    });

    router.push(`${ROUTES.SEND_CONFIRM}?${params.toString()}`);
  };

  const handleBack = () => {
    router.push(ROUTES.DASHBOARD);
  };

  useEffect(() => {
    if (ready && (!authenticated || !hasSession())) {
      router.push(ROUTES.LOGIN);
    }
  }, [ready, authenticated, router]);

  if (ready && (!authenticated || !hasSession())) {
    return null;
  }

  return (
    <div className="flex flex-col justify-between items-center gap-4 h-full w-full py-16 px-8">
      <div className="flex flex-col items-center gap-8 text-center w-full">
        <h1 className="text-3xl font-bold text-foreground text-left w-full">
          Send Crypto
        </h1>
        <p className="text-base text-muted-foreground text-left w-full">
          Send crypto privately to any username or address. Your transaction
          stays hidden.
        </p>

        <div className="space-y-6 w-full">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-foreground">
              To
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  @
                </span>
                <Input
                  id="recipient"
                  type="text"
                  placeholder="username"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="icon">
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground text-left">
                Send to username or paste address
              </p>
              {recipient.trim() && (
                <div className="flex items-center gap-2 text-xs">
                  {isValidatingRecipient || isChecking ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      <span className="text-muted-foreground">Checking...</span>
                    </>
                  ) : recipientValid === true ? (
                    <>
                      <Check className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">Valid</span>
                    </>
                  ) : recipientValid === false ? (
                    <>
                      <X className="h-3 w-3 text-destructive" />
                      <span className="text-destructive">
                        {recipientError || "Invalid"}
                      </span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">
              Amount
            </Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="1.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
                min={0}
              />
              <Button variant="outline">CDT</Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>≈ $2,685.00 USD</span>
              <span>
                {isLoadingBalances
                  ? "Loading balance..."
                  : `Balance: ${currentBalance.toFixed(4)} CDT`}
              </span>
            </div>
            {balanceError && (
              <p className="text-xs text-destructive text-right">
                {balanceError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount((currentBalance * 0.25).toFixed(4))}
              disabled={isLoadingBalances || currentBalance === 0}
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount((currentBalance * 0.5).toFixed(4))}
              disabled={isLoadingBalances || currentBalance === 0}
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(currentBalance.toFixed(4))}
              disabled={isLoadingBalances || currentBalance === 0}
            >
              Max
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <Label
                    htmlFor="privacy"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Privacy Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Transfer will use stealth address
                  </p>
                </div>
              </div>
              <Button
                variant={isPrivate ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPrivate(!isPrivate)}
              >
                {isPrivate ? "ON" : "OFF"}
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              Estimated Fee: ~0.0002 CDT ($0.36)
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <Button
          className="w-full"
          disabled={
            !recipient.trim() ||
            !amount.trim() ||
            recipientValid === false ||
            isValidatingRecipient ||
            isChecking ||
            !!balanceError ||
            isLoadingBalances
          }
          onClick={handleContinue}
        >
          Continue
        </Button>
        <Button variant="secondary" className="w-full" onClick={handleBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
