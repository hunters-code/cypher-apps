"use client";

import { useState, useMemo, useRef, useEffect } from "react";

import { useRouter } from "next/navigation";

import { Search, ChevronDown } from "lucide-react";

import { RecentActivityItem } from "@/components/transaction/RecentActivityItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Transaction {
  id: string;
  type: "SEND" | "RECEIVE";
  username: string;
  amount: string;
  token: string;
  timestamp: string;
  isPrivate?: boolean;
  dateGroup: string;
}

const allMockTransactions: Transaction[] = [
  {
    id: "1",
    type: "SEND",
    username: "alice",
    amount: "1.5",
    token: "ETH",
    timestamp: "2 hours ago",
    isPrivate: true,
    dateGroup: "Today",
  },
  {
    id: "2",
    type: "RECEIVE",
    username: "bob",
    amount: "0.5",
    token: "ETH",
    timestamp: "5 hours ago",
    isPrivate: false,
    dateGroup: "Today",
  },
  {
    id: "3",
    type: "RECEIVE",
    username: "charlie",
    amount: "100",
    token: "USDC",
    timestamp: "1 day ago",
    isPrivate: true,
    dateGroup: "Yesterday",
  },
  {
    id: "4",
    type: "SEND",
    username: "david",
    amount: "0.1",
    token: "ETH",
    timestamp: "2 days ago",
    isPrivate: false,
    dateGroup: "2 days ago",
  },
  {
    id: "5",
    type: "RECEIVE",
    username: "eve",
    amount: "50",
    token: "USDC",
    timestamp: "3 days ago",
    isPrivate: true,
    dateGroup: "3 days ago",
  },
  {
    id: "6",
    type: "SEND",
    username: "frank",
    amount: "2.0",
    token: "ETH",
    timestamp: "4 days ago",
    isPrivate: true,
    dateGroup: "4 days ago",
  },
];

const ITEMS_PER_PAGE = 5;

export default function HistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All Types");
  const [selectedToken, setSelectedToken] = useState<string>("All Tokens");
  const [showSearch, setShowSearch] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filteredTransactions = useMemo(() => {
    let filtered = allMockTransactions;

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
  }, [searchQuery, selectedType, selectedToken]);

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

  useEffect(() => {
    // Reset displayed count when filters change
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedType, selectedToken]);

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

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleTransactionClick = (transaction: Transaction) => {
    router.push(`/transaction/${transaction.id}`);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 w-full px-4 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">
              Transaction History
            </h1>
            <div className="flex gap-2">
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

          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(
              ([dateGroup, transactions]) => (
                <div key={dateGroup} className="space-y-4">
                  <h2 className="font-semibold text-foreground">{dateGroup}</h2>
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
                  Try adjusting your filters
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
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full px-4 py-4 bg-background border-t border-border shrink-0">
        <Button variant="secondary" className="w-full" onClick={handleBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
