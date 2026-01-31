"use client";

import { useState, useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";
import { QrCode, Lock, Loader2, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBaseProvider } from "@/hooks/useBlockchain";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useUsername } from "@/hooks/useUsername";
import { ROUTES } from "@/lib/constants/routes";
import { formatCryptoAmount } from "@/lib/utils/format";
import { hasSession } from "@/lib/utils/session";

export default function SendPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { authenticated, ready } = usePrivy();
  const provider = useBaseProvider();
  const { checkAvailability, isChecking } = useUsername();
  const initialRecipient = searchParams.get("recipient") || "";
  const initialToken = searchParams.get("token") || "ETH";

  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [token, setToken] = useState<"ETH" | "CDT">(
    (initialToken as "ETH" | "CDT") || "ETH"
  );
  const [isValidatingRecipient, setIsValidatingRecipient] = useState(false);
  const [recipientValid, setRecipientValid] = useState<boolean | null>(null);
  const [recipientError, setRecipientError] = useState("");
  const [balanceError, setBalanceError] = useState("");

  const { balances, isLoading: balancesLoading } = useTokenBalances();
  const balanceAmount = balances.find((b) => b.symbol === token)?.amount
    ? parseFloat(balances.find((b) => b.symbol === token)?.amount || "0")
    : 0;

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

        if (recipient.startsWith("0x") && recipient.length === 42) {
          setRecipientValid(true);
          setIsValidatingRecipient(false);
          return;
        }

        const isAvailable = await checkAvailability(cleanRecipient);

        if (isAvailable === false) {
          setRecipientValid(true);
          setRecipientError("");
        } else if (isAvailable === true) {
          setRecipientValid(false);
          setRecipientError("Username not found");
        } else {
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

    if (amountValue > balanceAmount) {
      setBalanceError("Insufficient balance");
      return;
    }

    setBalanceError("");
  }, [amount, balanceAmount]);

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

    const tokenPrice = token === "CDT" ? 0.1 : 1790;
    const usdValue = (parseFloat(amount) * tokenPrice).toFixed(2);

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
      fee: token === "CDT" ? "0" : "0.0002", // CDT transfers might have different fee
      feeUSD: token === "CDT" ? "0" : "0.36",
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
    <div className="mx-auto flex w-full max-w-4xl flex-col justify-between gap-6 px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-6 w-full">
        <div>
          <h1 className="font-urbanist text-2xl font-bold text-foreground md:text-3xl">
            Send
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Send crypto privately to any username or address.
          </p>
        </div>

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
                      <Check className="h-3 w-3 text-primary" />
                      <span className="text-primary">Valid</span>
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
              <div className="flex gap-1">
                <Button
                  variant={token === "ETH" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setToken("ETH")}
                >
                  ETH
                </Button>
                <Button
                  variant={token === "CDT" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setToken("CDT")}
                >
                  CDT
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {amount
                  ? `≈ $${(parseFloat(amount) * (token === "CDT" ? 0.1 : 1790)).toFixed(2)} USD`
                  : "≈ $0.00 USD"}
              </span>
              <span>
                Balance:{" "}
                {balancesLoading
                  ? "Loading..."
                  : balanceAmount
                    ? `${formatCryptoAmount(balanceAmount, 4)} ${token}`
                    : `0 ${token}`}
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
              onClick={() => setAmount((balanceAmount * 0.25).toFixed(4))}
              disabled={balancesLoading || balanceAmount === 0}
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount((balanceAmount * 0.5).toFixed(4))}
              disabled={balancesLoading || balanceAmount === 0}
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount(balanceAmount.toFixed(4))}
              disabled={balancesLoading || balanceAmount === 0}
            >
              Max
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
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

          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              Estimated Fee:{" "}
              {token === "CDT"
                ? "~0.0001 ETH (gas fee)"
                : "~0.0002 ETH ($0.36)"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Button
          size="lg"
          className="w-full"
          disabled={
            !recipient.trim() ||
            !amount.trim() ||
            recipientValid === false ||
            isValidatingRecipient ||
            isChecking ||
            !!balanceError ||
            balancesLoading
          }
          onClick={handleContinue}
        >
          Continue
        </Button>
        <Button variant="outline" className="w-full" onClick={handleBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
