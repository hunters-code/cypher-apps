"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { Copy, Check, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { ROUTES } from "@/lib/constants/routes";
import { hasSession } from "@/lib/utils/session";

export default function ReceivePage() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const { address, isLoading: walletLoading } = useWallet();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [username] = useState(() => {
    if (typeof window === "undefined") return "@username";
    return localStorage.getItem("cypher_username") || "@username";
  });

  const walletAddress = address || "0x0000000000000000000000000000000000000000";
  const qrCodeValue = username;

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
      } catch {}
    } else {
      handleCopyId();
    }
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
    <div className="flex min-h-full flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-1">
          <h1 className="font-urbanist text-2xl font-bold text-foreground md:text-3xl">
            Receive
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Share your Cypher ID or QR code to receive tokens privately.
          </p>
        </div>

        {/* QR Code card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border-2 border-primary bg-card shadow-lg"
        >
          <div className="rounded-t-2xl bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6">
            <div className="flex flex-col items-center gap-4">
              {walletLoading || !username ? (
                <div className="flex h-52 w-52 items-center justify-center rounded-xl bg-muted/50">
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <div className="rounded-xl bg-white p-4 shadow-inner">
                  <QRCodeSVG
                    value={qrCodeValue}
                    size={200}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: "/ghost-icon.svg",
                      height: 48,
                      width: 48,
                      excavate: true,
                    }}
                  />
                </div>
              )}
              <p className="text-sm font-medium text-foreground">
                Scan to send CDT
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center rounded-b-2xl bg-primary py-3">
            <p className="text-sm font-medium text-primary-foreground">
              Payments received privately through Cypher
            </p>
          </div>
        </motion.div>

        {/* Your Cypher ID */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5"
        >
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Your Cypher ID
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <span className="min-w-0 flex-1 truncate font-medium text-foreground">
              {username}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopyId}
              className="shrink-0 text-muted-foreground hover:text-primary"
              aria-label="Copy"
            >
              {copiedId ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {copiedId && (
            <p className="mt-2 text-xs text-primary">Copied to clipboard</p>
          )}
        </motion.div>

        {/* Wallet address */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5"
        >
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Wallet address (public)
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground md:text-sm">
              {walletAddress}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopyAddress}
              className="shrink-0 text-muted-foreground hover:text-primary"
              aria-label="Copy address"
            >
              {copiedAddress ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {copiedAddress && (
            <p className="mt-2 text-xs text-primary">Copied to clipboard</p>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3 pt-2"
        >
          <Button size="lg" className="w-full" onClick={handleShare}>
            <Share2 className="mr-2 h-5 w-5" />
            Share to receive
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
