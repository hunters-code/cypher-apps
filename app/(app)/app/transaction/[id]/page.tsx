"use client";

import { useState, useEffect } from "react";

import { useRouter, useParams } from "next/navigation";

import {
  ArrowUp,
  ArrowDown,
  Lock,
  Copy,
  Check,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { formatCryptoAmount, formatUSDValue } from "@/lib/utils/format";

interface TransactionDetail {
  id: string;
  type: "SEND" | "RECEIVE";
  username: string;
  amount: string;
  token: string;
  usdValue: string;
  timestamp: string;
  dateTime: string;
  isPrivate: boolean;
  status: "CONFIRMED" | "PENDING" | "FAILED";
  blockNumber: string;
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  gasFee: string;
  gasFeeUSD: string;
}

const mockTransactions: Record<string, TransactionDetail> = {
  "1": {
    id: "1",
    type: "SEND",
    username: "alice",
    amount: "1.5",
    token: "ETH",
    usdValue: "2685.00",
    timestamp: "2 hours ago",
    dateTime: "Dec 17, 2025 14:32:15",
    isPrivate: true,
    status: "CONFIRMED",
    blockNumber: "12345678",
    transactionHash: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
    fromAddress: "0x9a3d6c5f8e2b1a7c4d9e8f3b2a1c6d5e4f3a2b1c",
    toAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
    gasFee: "0.0002",
    gasFeeUSD: "0.36",
  },
  "2": {
    id: "2",
    type: "RECEIVE",
    username: "bob",
    amount: "0.5",
    token: "ETH",
    usdValue: "895.00",
    timestamp: "5 hours ago",
    dateTime: "Dec 17, 2025 11:15:30",
    isPrivate: false,
    status: "CONFIRMED",
    blockNumber: "12345650",
    transactionHash: "0x8f3b2a1c6d5e4f3a2b1c9a3d6c5f8e2b1a7c4d9e",
    fromAddress: "0x8f3b2a1c6d5e4f3a2b1c9a3d6c5f8e2b1a7c4d9e",
    toAddress: "0x9a3d6c5f8e2b1a7c4d9e8f3b2a1c6d5e4f3a2b1c",
    gasFee: "0.0001",
    gasFeeUSD: "0.18",
  },
  "3": {
    id: "3",
    type: "RECEIVE",
    username: "charlie",
    amount: "100",
    token: "USDC",
    usdValue: "100.00",
    timestamp: "1 day ago",
    dateTime: "Dec 16, 2025 09:20:45",
    isPrivate: true,
    status: "CONFIRMED",
    blockNumber: "12345000",
    transactionHash: "0x5e4f3a2b1c9a3d6c5f8e2b1a7c4d9e8f3b2a1c6d",
    fromAddress: "0x5e4f3a2b1c9a3d6c5f8e2b1a7c4d9e8f3b2a1c6d",
    toAddress: "0x9a3d6c5f8e2b1a7c4d9e8f3b2a1c6d5e4f3a2b1c",
    gasFee: "0.00015",
    gasFeeUSD: "0.27",
  },
};

function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params?.id as string;
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedFrom, setCopiedFrom] = useState(false);
  const [copiedTo, setCopiedTo] = useState(false);

  const transaction = transactionId ? mockTransactions[transactionId] : null;

  useEffect(() => {
    if (!transaction) {
      router.push(ROUTES.HISTORY);
    }
  }, [transaction, router]);

  if (!transaction) {
    return null;
  }

  const isSend = transaction.type === "SEND";
  const Icon = isSend ? ArrowUp : ArrowDown;
  const iconColor = isSend ? "text-destructive" : "text-green-600";
  const iconBg = isSend ? "bg-destructive/10" : "bg-green-600/10";
  const amountColor = isSend ? "text-destructive" : "text-green-600";
  const prefix = isSend ? "-" : "+";

  const handleCopyHash = async () => {
    if (transaction.transactionHash) {
      await navigator.clipboard.writeText(transaction.transactionHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handleCopyFrom = async () => {
    if (transaction.fromAddress) {
      await navigator.clipboard.writeText(transaction.fromAddress);
      setCopiedFrom(true);
      setTimeout(() => setCopiedFrom(false), 2000);
    }
  };

  const handleCopyTo = async () => {
    if (transaction.toAddress) {
      await navigator.clipboard.writeText(transaction.toAddress);
      setCopiedTo(true);
      setTimeout(() => setCopiedTo(false), 2000);
    }
  };

  const handleViewOnExplorer = () => {
    window.open(
      `https://basescan.org/tx/${transaction.transactionHash}`,
      "_blank"
    );
  };

  const handleBack = () => {
    router.push(ROUTES.HISTORY);
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "CONFIRMED":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case "CONFIRMED":
        return "Confirmed";
      case "PENDING":
        return "Pending";
      case "FAILED":
        return "Failed";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 w-full px-4 py-8">
          <h1 className="text-3xl font-bold text-foreground">
            Transaction Details
          </h1>

          <div className="flex flex-col items-center gap-4 p-6 border rounded-lg bg-card">
            <div className={`p-3 rounded-full ${iconBg}`}>
              <Icon className={`h-8 w-8 ${iconColor}`} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  {isSend ? "Sent to" : "Received from"} @{transaction.username}
                </span>
                {transaction.isPrivate && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className={`text-3xl font-bold ${amountColor}`}>
                {prefix}
                {formatCryptoAmount(transaction.amount)} {transaction.token}
              </div>
              <div className="text-sm text-muted-foreground">
                ≈ {formatUSDValue(transaction.usdValue)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-px bg-border" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className="text-sm font-medium">{getStatusText()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Time</span>
                <span className="text-sm font-medium">
                  {transaction.dateTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Block</span>
                <span className="text-sm font-medium">
                  #{transaction.blockNumber}
                </span>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">From</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground">
                    {formatAddress(transaction.fromAddress)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopyFrom}
                  >
                    {copiedFrom ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">To</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground">
                    {formatAddress(transaction.toAddress)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopyTo}
                  >
                    {copiedTo ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Transaction Hash
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground truncate max-w-[120px]">
                    {formatAddress(transaction.transactionHash)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCopyHash}
                  >
                    {copiedHash ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gas Fee</span>
                <span className="text-sm font-medium">
                  {formatCryptoAmount(transaction.gasFee)} ETH (
                  {formatUSDValue(transaction.gasFeeUSD)})
                </span>
              </div>
              {transaction.isPrivate && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Privacy Mode
                    </span>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    Enabled
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleViewOnExplorer}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on BaseScan
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl shrink-0 border-t border-border bg-background px-4 py-4">
        <div className="flex flex-col gap-3">
          <Button variant="outline" className="w-full" onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
