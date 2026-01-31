"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";
import { QrCode, Loader2, Check, X, ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBaseProvider } from "@/hooks/useBlockchain";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useUsername } from "@/hooks/useUsername";
import { ROUTES } from "@/lib/constants/routes";
import {
  AVAILABLE_TOKENS,
  SEND_TOKEN_OPTIONS,
  TOKEN_ICONS,
} from "@/lib/constants/tokens";
import { formatCryptoAmount, formatUSDValue } from "@/lib/utils/format";
import { hasSession } from "@/lib/utils/session";
import { getTokenPriceOrZero } from "@/lib/utils/tokenPrice";

const TOKEN_COLORS: Record<string, { bg: string; text: string }> = {
  ETH: { bg: "bg-blue-500/20", text: "text-blue-600" },
  CDT: { bg: "bg-emerald-500/20", text: "text-emerald-600" },
};

function TokenIconBadge({
  symbol,
  name,
  logoURI,
  size = "md",
}: {
  symbol: string;
  name?: string;
  logoURI?: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const iconSrc = logoURI ?? TOKEN_ICONS[symbol];

  if (iconSrc) {
    const dim = size === "sm" ? 24 : 32;
    return (
      <span
        className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${sizeClass} bg-muted/20`}
      >
        <Image
          src={iconSrc}
          alt={symbol}
          width={dim}
          height={dim}
          className="object-cover"
        />
      </span>
    );
  }

  const letter = (symbol || name?.charAt(0) || "?").charAt(0).toUpperCase();
  const colors = TOKEN_COLORS[symbol] ?? {
    bg: "bg-muted/30",
    text: "text-muted-foreground",
  };
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClass} text-xs ${colors.bg} ${colors.text}`}
    >
      {letter}
    </span>
  );
}

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
  const [isPrivate] = useState(true);
  const [token, setToken] = useState<"ETH" | "CDT">(
    (initialToken as "ETH" | "CDT") || "ETH"
  );
  const [isValidatingRecipient, setIsValidatingRecipient] = useState(false);
  const [recipientValid, setRecipientValid] = useState<boolean | null>(null);
  const [recipientError, setRecipientError] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [tokenSearch, setTokenSearch] = useState("");

  const filteredTokens = SEND_TOKEN_OPTIONS.filter(
    (t) =>
      t.symbol.toLowerCase().includes(tokenSearch.toLowerCase().trim()) ||
      t.name.toLowerCase().includes(tokenSearch.toLowerCase().trim())
  );

  const { balances, isLoading: balancesLoading } = useTokenBalances();
  const { prices: tokenPrices } = useTokenPrices(AVAILABLE_TOKENS);
  const tokenInfo = AVAILABLE_TOKENS.find((t) => t.symbol === token);
  const priceUSD = tokenPrices[token] ?? 0;
  const tokenPrice = getTokenPriceOrZero(tokenInfo, priceUSD);
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

    const usdValue = tokenInfo?.tradable
      ? (parseFloat(amount) * tokenPrice).toFixed(2)
      : "0";

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
      fee: token === "CDT" ? "0" : "0.0002",
      feeUSD: tokenInfo?.tradable ? "0.36" : "0",
    });

    router.push(`${ROUTES.SEND_CONFIRM}?${params.toString()}`);
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <div>
        <h1 className="font-urbanist text-2xl font-bold text-foreground md:text-3xl">
          Send
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Send crypto privately to any username or address.
        </p>
      </div>

      <div className="space-y-6 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="space-y-2">
          <Label htmlFor="recipient" className="text-foreground font-medium">
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
            <Link href={ROUTES.SCAN}>
              <Button
                variant="outline"
                size="icon"
                type="button"
                aria-label="Scan QR code"
              >
                <QrCode className="h-4 w-4" />
              </Button>
            </Link>
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
          <Label htmlFor="amount" className="text-foreground font-medium">
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
            <Dialog
              open={tokenModalOpen}
              onOpenChange={(open) => {
                setTokenModalOpen(open);
                if (!open) setTokenSearch("");
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-w-[5rem] justify-between gap-2"
                  type="button"
                >
                  <span className="flex items-center gap-1.5">
                    <TokenIconBadge
                      symbol={token}
                      name={
                        SEND_TOKEN_OPTIONS.find((t) => t.symbol === token)?.name
                      }
                      logoURI={TOKEN_ICONS[token]}
                      size="sm"
                    />
                    {token}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Token</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search tokens..."
                      value={tokenSearch}
                      onChange={(e) => setTokenSearch(e.target.value)}
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
                    {filteredTokens.length === 0 ? (
                      <p className="p-4 text-center text-sm text-muted-foreground">
                        No token found
                      </p>
                    ) : (
                      <ul className="divide-y divide-border">
                        {filteredTokens.map((t) => {
                          const bal = balances.find(
                            (b) => b.symbol === t.symbol
                          );
                          const balAmount = bal?.amount
                            ? parseFloat(bal.amount)
                            : 0;
                          return (
                            <li key={t.symbol}>
                              <button
                                type="button"
                                onClick={() => {
                                  setToken(t.symbol);
                                  setTokenModalOpen(false);
                                  setTokenSearch("");
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
                              >
                                <TokenIconBadge
                                  symbol={t.symbol}
                                  name={t.name}
                                  logoURI={t.logoURI}
                                  size="md"
                                />
                                <div className="min-w-0 flex-1 flex flex-col items-start">
                                  <span className="font-medium">
                                    {t.symbol}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {t.name}
                                  </span>
                                </div>
                                <span className="shrink-0 text-sm text-muted-foreground">
                                  {balancesLoading
                                    ? "..."
                                    : `${formatCryptoAmount(balAmount, 4)}`}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {amount && tokenInfo?.tradable
                ? formatUSDValue(parseFloat(amount) * tokenPrice)
                : "$0.00"}
            </span>
            <span>
              Balance:{" "}
              {balancesLoading
                ? "Loading..."
                : balanceAmount
                  ? `${formatCryptoAmount(balanceAmount, 4)} ${token}`
                  : `0.00 ${token}`}
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
      </div>
    </div>
  );
}
