"use client";

import { useState } from "react";

import { MoreHorizontal, Loader2 } from "lucide-react";

import { RecentActivityItem } from "@/components/transaction/RecentActivityItem";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/hooks/useTransactionHistory";
import { cn } from "@/lib/utils";

type TabId = "all" | "incoming" | "outgoing";

interface TransactionHistorySectionProps {
  transactions: Transaction[];
  isLoading?: boolean;
  error?: string | null;
}

export function TransactionHistorySection({
  transactions,
  isLoading = false,
  error = null,
}: TransactionHistorySectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const filtered =
    activeTab === "all"
      ? transactions
      : activeTab === "incoming"
        ? transactions.filter((a) => a.type === "RECEIVE")
        : transactions.filter((a) => a.type === "SEND");

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "incoming", label: "Incoming" },
    { id: "outgoing", label: "Outgoing" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-urbanist text-lg font-semibold text-foreground">
          Transaction History
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground md:hidden"
            aria-label="More"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="rounded-xl border border-border bg-muted/20 py-8 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
            <p className="mt-2">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-border bg-destructive/10 py-8 text-center text-sm text-destructive">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/20 py-8 text-center text-sm text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          filtered.map((transaction) => (
            <RecentActivityItem
              key={transaction.id}
              type={transaction.type}
              username={transaction.username}
              amount={transaction.amount}
              token={transaction.token}
              timestamp={transaction.timestamp}
              isPrivate={transaction.isPrivate}
            />
          ))
        )}
      </div>
    </div>
  );
}
