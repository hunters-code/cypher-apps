"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";
import { QrCode, Lock, Loader2, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBaseProvider } from "@/hooks/useBlockchain";
import { getAddress } from "@/lib/blockchain";
import { ROUTES } from "@/lib/constants/routes";
import { hasSession } from "@/lib/utils/session";

export default function SendPage() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const provider = useBaseProvider();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [token] = useState("ETH");
  const [isValidatingRecipient, setIsValidatingRecipient] = useState(false);
  const [recipientValid, setRecipientValid] = useState<boolean | null>(null);
  const [recipientError, setRecipientError] = useState("");

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

        // Check if username exists
        try {
          const address = await getAddress(provider, cleanRecipient);
          if (
            address &&
            address !== "0x0000000000000000000000000000000000000000"
          ) {
            setRecipientValid(true);
          } else {
            setRecipientValid(false);
            setRecipientError("Username not found");
          }
        } catch {
          setRecipientValid(false);
          setRecipientError("Username not found");
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
  }, [recipient, provider]);

  const handleContinue = () => {
    if (!recipient.trim() || !amount.trim()) {
      return;
    }

    if (recipientValid === false || isValidatingRecipient) {
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
                  {isValidatingRecipient ? (
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
              />
              <Button variant="outline">ETH</Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>≈ $2,685.00 USD</span>
              <span>Balance: 1.2458 ETH</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm">
              25%
            </Button>
            <Button variant="outline" size="sm">
              50%
            </Button>
            <Button variant="outline" size="sm">
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
              Estimated Fee: ~0.0002 ETH ($0.36)
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
            isValidatingRecipient
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
