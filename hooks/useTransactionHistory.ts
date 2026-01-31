"use client";

import { useCallback, useEffect, useState } from "react";

import { useBaseProvider } from "@/hooks/useBlockchain";
import { useWallet } from "@/hooks/useWallet";
import {
  scanForIncomingTransfers,
  parseMetadata,
  type AnnouncementEvent,
} from "@/lib/blockchain";
import { getUsername } from "@/lib/blockchain/registry";

export interface Transaction {
  id: string;
  type: "SEND" | "RECEIVE";
  username: string;
  amount: string;
  token: string;
  timestamp: string;
  timestampNumber: number;
  isPrivate?: boolean;
  dateGroup: string;
  transactionHash: string;
  sender: string;
  stealthAddress: string;
}

function formatTimestamp(timestamp: number): string {
  if (!timestamp || timestamp <= 0) {
    return "Unknown";
  }

  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) {
    return "Just now";
  }
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDateGroup(timestamp: number): string {
  if (!timestamp || timestamp <= 0) {
    return "Unknown";
  }

  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 86400) {
    return "Today";
  }
  if (diff < 172800) {
    return "Yesterday";
  }
  if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days} days ago`;
  }

  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

async function convertAnnouncementToTransaction(
  event: AnnouncementEvent,
  provider: ReturnType<typeof useBaseProvider>
): Promise<Transaction | null> {
  if (!provider) {
    return null;
  }

  try {
    const metadata = parseMetadata(event.metadata);

    let username: string | null = null;
    try {
      username = await getUsername(provider, event.sender);

      if (username && username.trim() !== "") {
      } else {
        username = null;
      }
    } catch {
      username = null;
    }

    const displayUsername =
      username && username.trim() !== ""
        ? username.replace(/^@+/, "")
        : event.sender.slice(0, 6) + "..." + event.sender.slice(-4);

    const validTimestamp =
      event.timestamp > 0 ? event.timestamp : Math.floor(Date.now() / 1000);

    const metadataObj = metadata as Record<string, unknown>;
    const amount =
      typeof metadataObj.amount === "string" ? metadataObj.amount : "0";
    const tokenSymbol =
      typeof metadataObj.tokenSymbol === "string"
        ? metadataObj.tokenSymbol
        : typeof metadataObj.token === "string"
          ? metadataObj.token
          : "ETH";
    const token = tokenSymbol.toUpperCase();

    const transaction = {
      id: event.transactionHash,
      type: "RECEIVE" as const,
      username: displayUsername,
      amount: amount,
      token: token,
      timestamp: formatTimestamp(validTimestamp),
      timestampNumber: validTimestamp,
      isPrivate: true,
      dateGroup: getDateGroup(validTimestamp),
      transactionHash: event.transactionHash,
      sender: event.sender,
      stealthAddress: event.stealthAddress,
    };

    return transaction;
  } catch {
    return null;
  }
}

export function useTransactionHistory(): {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const provider = useBaseProvider();
  const { address } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getViewingKeyPrivate = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    try {
      const keysData = localStorage.getItem("cypher_keys");
      if (!keysData) return null;

      const keys = JSON.parse(keysData) as {
        viewingKeyPrivate?: string;
      };
      return keys.viewingKeyPrivate || null;
    } catch {
      return null;
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!provider || !address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const viewingKeyPrivate = getViewingKeyPrivate();

      if (!viewingKeyPrivate) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      const events = await scanForIncomingTransfers(
        provider,
        viewingKeyPrivate
      );

      const convertedTransactions = await Promise.all(
        events.map(async (event) => {
          try {
            const tx = await convertAnnouncementToTransaction(event, provider);
            return tx;
          } catch {
            return null;
          }
        })
      );

      const validTransactions = convertedTransactions.filter(
        (tx): tx is Transaction => tx !== null
      );

      const sortedTransactions = validTransactions.sort(
        (a, b) => b.timestampNumber - a.timestampNumber
      );

      setTransactions(sortedTransactions);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch transactions";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [provider, address, getViewingKeyPrivate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}
