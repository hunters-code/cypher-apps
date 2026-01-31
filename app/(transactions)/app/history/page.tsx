"use client";

import { useState, useMemo, useRef, useEffect } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";
import { Search, ChevronDown, RefreshCw } from "lucide-react";

import { RecentActivityItem } from "@/components/transaction/RecentActivityItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useTransactionHistory,
  type Transaction,
} from "@/hooks/useTransactionHistory";
import { ROUTES } from "@/lib/constants/routes";
import { hasSession } from "@/lib/utils/session";

const ITEMS_PER_PAGE = 5;

export default function HistoryPage() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const {
    transactions: allTransactions,
    isLoading,
    error,
    refetch,
  } = useTransactionHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [selectedToken, setSelectedToken] = useState<string>("All Tokens");
  const [showSearch, setShowSearch] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;

    if (searchQuery) {
      filtered = filtered.filter(
        (tx) =>
          tx.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.amount.includes(searchQuery) ||
          tx.token.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== "All Types") {
      filtered = filtered.filter((tx) => tx.type === selectedType);
    }

    if (selectedToken !== "All Tokens") {
      filtered = filtered.filter((tx) => tx.token === selectedToken);
    }

    return filtered;
  }, [allTransactions, searchQuery, selectedType, selectedToken]);

  const displayedTransactions = useMemo(() => {
    return filteredTransactions.slice(0, displayedCount);
  }, [filteredTransactions, displayedCount]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    displayedTransactions.forEach((tx) => {
      if (!groups[tx.dateGroup]) {
        groups[tx.dateGroup] = [];
      }
      groups[tx.dateGroup].push(tx);
    });
    return groups;
  }, [displayedTransactions]);

  const hasMore = displayedCount < filteredTransactions.length;

  const filterKey = useMemo(
    () => `${searchQuery}-${selectedType}-${selectedToken}`,
    [searchQuery, selectedType, selectedToken]
  );
  const prevFilterKeyRef = useRef(filterKey);

  useEffect(() => {
    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      queueMicrotask(() => setDisplayedCount(ITEMS_PER_PAGE));
    }
  }, [filterKey]);

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;

    const currentRef = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) =>
            Math.min(prev + ITEMS_PER_PAGE, filteredTransactions.length)
          );
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, filteredTransactions.length]);

  const handleTransactionClick = (transaction: Transaction) => {
    router.push(ROUTES.TRANSACTION(transaction.id));
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
        <div className="mx-auto flex max-w-5xl flex-col gap-6 w-full px-4 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">
              Transaction History
            </h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  const types = ["All Types", "SEND", "RECEIVE"];
                  const currentIndex = types.indexOf(selectedType);
                  setSelectedType(types[(currentIndex + 1) % types.length]);
                }}
              >
                {selectedType} <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  const tokens = ["All Tokens", "ETH", "USDC"];
                  const currentIndex = tokens.indexOf(selectedToken);
                  setSelectedToken(tokens[(currentIndex + 1) % tokens.length]);
                }}
              >
                {selectedToken} <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </div>

            {showSearch && (
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 w-full rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-destructive">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(
                ([dateGroup, transactions]) => (
                  <div key={dateGroup} className="space-y-4">
                    <h2 className="font-semibold text-foreground">
                      {dateGroup}
                    </h2>
                    <div className="space-y-2">
                      {transactions.map((transaction) => (
                        <RecentActivityItem
                          key={transaction.id}
                          type={transaction.type}
                          username={transaction.username}
                          amount={transaction.amount}
                          token={transaction.token}
                          timestamp={transaction.timestamp}
                          isPrivate={transaction.isPrivate}
                          onClick={() => handleTransactionClick(transaction)}
                        />
                      ))}
                    </div>
                  </div>
                )
              )}

              {filteredTransactions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">No transactions found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {searchQuery ||
                    selectedType !== "All Types" ||
                    selectedToken !== "All Tokens"
                      ? "Try adjusting your filters"
                      : "You haven't received any transactions yet"}
                  </p>
                </div>
              )}

              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-4">
                  <div className="text-sm text-muted-foreground">
                    Loading more...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
