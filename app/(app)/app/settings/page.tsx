"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";
import {
  Copy,
  Check,
  User,
  Wallet,
  Shield,
  Lock,
  Bell,
  DollarSign,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
} from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { ROUTES } from "@/lib/constants/routes";
import { hasSession, clearSession } from "@/lib/utils/session";

export default function SettingsPage() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);

  const { logout, authenticated, ready } = usePrivy();

  useEffect(() => {
    if (ready && (!authenticated || !hasSession())) {
      router.push(ROUTES.LOGIN);
    }
  }, [ready, authenticated, router]);

  const username = "@nashirjamali";
  const walletAddress = "0x9a3d6c5f8e2b1a7c4d9e8f3b2a1c6d5e4f3a2b1c";

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyUsername = async () => {
    await navigator.clipboard.writeText(username);
    setCopiedUsername(true);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Account</h2>
              <Item
                variant="default"
                className="cursor-pointer hover:bg-muted/50 w-full"
                onClick={handleCopyUsername}
              >
                <ItemMedia variant="icon">
                  <User className="h-4 w-4 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-left">{username}</ItemTitle>
                  <ItemDescription className="text-left">
                    Username
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  {copiedUsername ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </ItemActions>
              </Item>
              <ItemSeparator />
              <Item
                variant="default"
                className="cursor-pointer hover:bg-muted/50 w-full"
                onClick={handleCopyAddress}
              >
                <ItemMedia variant="icon">
                  <Wallet className="h-4 w-4 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-left">
                    {formatAddress(walletAddress)}
                  </ItemTitle>
                  <ItemDescription className="text-left">
                    Wallet Address
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
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
                </ItemActions>
              </Item>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Security
              </h2>
              <Item
                variant="default"
                className="cursor-pointer hover:bg-muted/50 w-full"
              >
                <ItemMedia variant="icon">
                  <Shield className="h-4 w-4 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Backup & Recovery</ItemTitle>
                  <ItemDescription>Save your wallet securely</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </ItemActions>
              </Item>
              <ItemSeparator />
              <Item
                variant="default"
                className="cursor-pointer hover:bg-muted/50 w-full"
              >
                <ItemMedia variant="icon">
                  <Lock className="h-4 w-4 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Privacy Settings</ItemTitle>
                  <ItemDescription>
                    Manage stealth address preferences
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </ItemActions>
              </Item>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">
                Preferences
              </h2>
              <Item
                variant="default"
                className="cursor-pointer hover:bg-muted/50"
              >
                <ItemMedia variant="icon">
                  <DollarSign className="h-4 w-4 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Currency</ItemTitle>
                  <ItemDescription>USD - United States Dollar</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </ItemActions>
              </Item>
              <ItemSeparator />
              <Item variant="default">
                <ItemMedia variant="icon">
                  <Bell className="h-4 w-4 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Notifications</ItemTitle>
                  <ItemDescription>Transaction alerts</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Switch
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </ItemActions>
              </Item>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">About</h2>
              <Item
                variant="default"
                className="cursor-pointer hover:bg-muted/50"
              >
                <ItemMedia variant="icon">
                  <HelpCircle className="h-4 w-4 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Help & Support</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </ItemActions>
              </Item>
              <ItemSeparator />
              <Item
                variant="default"
                className="cursor-pointer hover:bg-muted/50"
              >
                <ItemMedia variant="icon">
                  <FileText className="h-4 w-4 text-primary" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Terms & Privacy</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </ItemActions>
              </Item>
              <ItemSeparator />
              <Item variant="default">
                <ItemContent>
                  <ItemDescription>Version 1.0.0</ItemDescription>
                </ItemContent>
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
