"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Lock } from "lucide-react";

export default function SendPage() {
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [token] = useState("ETH");

  const handleContinue = () => {
    if (!recipient.trim() || !amount.trim()) {
      return;
    }

    const usdValue = (parseFloat(amount) * 1790).toFixed(2);
    const params = new URLSearchParams({
      recipient: recipient.startsWith("@") ? recipient : `@${recipient}`,
      amount,
      token,
      private: isPrivate.toString(),
      usdValue,
      fee: "0.0002",
      feeUSD: "0.36",
    });

    router.push(`/send/confirm?${params.toString()}`);
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col justify-between items-center gap-4 h-full w-full py-16 px-8">
      <div className="flex flex-col items-center gap-8 text-center w-full">
        <h1 className="text-3xl font-bold text-foreground text-left w-full">
          Send Crypto
        </h1>
        <p className="text-base text-muted-foreground text-left w-full">
          Send crypto privately to any username or address. Your transaction stays hidden.
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
            <p className="text-xs text-muted-foreground text-left">
              Send to username or paste address
            </p>
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
            <Button variant="outline" size="sm">25%</Button>
            <Button variant="outline" size="sm">50%</Button>
            <Button variant="outline" size="sm">Max</Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <Label htmlFor="privacy" className="text-sm font-medium cursor-pointer">
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
          disabled={!recipient.trim() || !amount.trim()}
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

