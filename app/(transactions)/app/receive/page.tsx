"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { Copy, Check, Share2, Lock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const qrCodeValue = username; // QR code contains username, not wallet address

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
      } catch (err) {
        console.error("Error sharing:", err);
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
              Receive CDT Token
            </h1>
            <p className="text-base text-muted-foreground text-left w-full">
              Scan QR code or share your username to receive CDT tokens
              privately.
            </p>

            <div className="space-y-4 w-full">
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.1,
                  }}
                  className="relative"
                >
                  {/* Outer glow effect - animated */}
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/20 to-primary/30 blur-2xl"
                  />

                  {/* Main container with gradient border */}
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative border-2 border-gray-600/50 rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full max-w-xs shadow-2xl backdrop-blur-sm"
                  >
                    {/* Gradient border glow */}
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-gray-600 via-gray-500 to-gray-600 opacity-30 blur-sm -z-10" />

                    <div className="flex flex-col items-center justify-center space-y-3">
                      {walletLoading || !username ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-3 sm:p-4 bg-background rounded-lg flex items-center justify-center h-32 w-32"
                        >
                          <div className="animate-pulse text-muted-foreground">
                            Loading...
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.3,
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          }}
                          className="relative p-4 bg-white rounded-xl shadow-2xl"
                        >
                          {/* Multiple pulse rings for depth */}
                          <motion.div
                            animate={{
                              scale: [1, 1.08, 1],
                              opacity: [0.2, 0, 0.2],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="absolute inset-0 rounded-xl bg-primary/20"
                          />
                          <motion.div
                            animate={{
                              scale: [1, 1.05, 1],
                              opacity: [0.15, 0, 0.15],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.3,
                            }}
                            className="absolute inset-0 rounded-xl bg-primary/15"
                          />

                          {/* QR Code with ghost icon */}
                          <div className="relative z-10">
                            <QRCodeSVG
                              value={qrCodeValue}
                              size={240}
                              level="H"
                              includeMargin={true}
                              imageSettings={{
                                src: "/ghost-icon.svg",
                                height: 64,
                                width: 64,
                                excavate: true,
                              }}
                            />
                          </div>

                          {/* Shine effect overlay */}
                          <motion.div
                            animate={{
                              x: ["-100%", "200%"],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatDelay: 2,
                              ease: "easeInOut",
                            }}
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent -z-0"
                            style={{ transform: "skewX(-20deg)" }}
                          />
                        </motion.div>
                      )}
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        className="text-sm font-medium text-white"
                      >
                        Receive CDT Token
                      </motion.p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-2"
              >
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyId}
                      className="shrink-0"
                    >
                      {copiedId ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </motion.div>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </motion.div>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Share this username to receive crypto privately
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-2"
              >
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
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyAddress}
                      className="shrink-0"
                    >
                      {copiedAddress ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </motion.div>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </motion.div>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  Direct wallet address (public) - or use username for private
                  transfers
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Private by Default
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground text-left">
                      Scan this QR code to send CDT tokens to your username.
                      Funds will use stealth addresses and remain private.
                    </p>
                  </div>
                </div>
              </motion.div>
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
