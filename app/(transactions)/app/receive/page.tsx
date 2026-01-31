"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";
import { QrCode, Copy, Check, Share2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants/routes";
import { hasSession } from "@/lib/utils/session";

export default function ReceivePage() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [username] = useState(() => {
    if (typeof window === "undefined") return "@username";
    return localStorage.getItem("cypher_username") || "@username";
  });
  const [walletAddress] = useState(
    "0x0000000000000000000000000000000000000000"
  );

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(username);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Cypher Wallet",
          text: `Send me crypto: ${username}`,
          url: window.location.href,
        });
      } catch {
      }
    } else {
      handleCopyId();
    }
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
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center gap-6 w-full px-4 py-8">
          <div className="flex flex-col items-center gap-4 text-center w-full max-w-md">
            <h1 className="text-3xl font-bold text-foreground text-left w-full">
              Receive Crypto
            </h1>
            <p className="text-base text-muted-foreground text-left w-full">
              Share your username or wallet address to receive crypto privately.
            </p>

            <div className="space-y-4 w-full">
              <div className="flex justify-center">
                <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 sm:p-6 bg-linear-to-br from-primary/5 to-primary/10 w-full max-w-xs">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 sm:p-4 bg-background rounded-lg">
                      <QrCode className="h-24 w-24 sm:h-32 sm:w-32 text-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {username}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Your Cypher ID
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={username}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyId}
                    className="shrink-0"
                  >
                    {copiedId ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Share this username to receive crypto privately
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">
                  Your Wallet Address
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    value={walletAddress}
                    readOnly
                    className="flex-1 text-xs font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyAddress}
                    className="shrink-0"
                  >
                    {copiedAddress ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Direct wallet address (public)
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Private by Default
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground text-left">
                      Funds sent to your username will use stealth addresses and
                      remain private.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full px-4 py-4 bg-background border-t border-border shrink-0">
        <Button className="w-full" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share QR Code
        </Button>
        <Button variant="secondary" className="w-full" onClick={handleBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
