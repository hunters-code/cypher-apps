"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";
import { Copy, Check, User, Wallet, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemSeparator,
} from "@/components/ui/item";
import { useWallet } from "@/hooks/useWallet";
import { ROUTES } from "@/lib/constants/routes";
import {
  hasSession,
  clearSession,
  getSessionUsername,
} from "@/lib/utils/session";

export default function SettingsPage() {
  const router = useRouter();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [username] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return (
      getSessionUsername() ?? localStorage.getItem("cypher_username") ?? null
    );
  });

  const { logout, authenticated, ready } = usePrivy();
  const { address, walletAddress: privyWalletAddress } = useWallet();

  const walletAddress = address ?? privyWalletAddress ?? null;

  useEffect(() => {
    if (ready && (!authenticated || !hasSession())) {
      router.push(ROUTES.LOGIN);
    }
  }, [ready, authenticated, router]);

  const handleCopyAddress = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyUsername = async () => {
    if (!username) return;
    await navigator.clipboard.writeText(username);
    setCopiedUsername(true);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const formatAddress = (addr: string): string => {
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleLogout = async () => {
    clearSession();
    await logout();
    router.push(ROUTES.HOME);
  };

  if (ready && (!authenticated || !hasSession())) {
    return null;
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 w-full px-4 py-8">
          <h1 className="font-urbanist text-3xl font-bold text-foreground">
            Settings
          </h1>
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Account</h2>
              <Item
                variant="default"
                className={
                  username
                    ? "cursor-pointer hover:bg-muted/50 w-full"
                    : "w-full opacity-80"
                }
                onClick={username ? handleCopyUsername : undefined}
              >
                <ItemMedia variant="icon">
                  <User className="h-4 w-4 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-left">{username ?? "—"}</ItemTitle>
                  <ItemDescription className="text-left">
                    Username
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  {username &&
                    (copiedUsername ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    ))}
                </ItemActions>
              </Item>
              <ItemSeparator />
              <Item
                variant="default"
                className={
                  walletAddress
                    ? "cursor-pointer hover:bg-muted/50 w-full"
                    : "w-full opacity-80"
                }
                onClick={walletAddress ? handleCopyAddress : undefined}
              >
                <ItemMedia variant="icon">
                  <Wallet className="h-4 w-4 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-left">
                    {walletAddress ? formatAddress(walletAddress) : "—"}
                  </ItemTitle>
                  <ItemDescription className="text-left">
                    Wallet Address
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  {walletAddress && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleCopyAddress}
                    >
                      {copiedAddress ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  )}
                </ItemActions>
              </Item>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
