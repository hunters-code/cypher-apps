"use client";

import { useState } from "react";

import { MoreHorizontal } from "lucide-react";

import { RecentActivityItem } from "@/components/transaction/RecentActivityItem";
import type { RecentActivity } from "@/components/transaction/RecentActivityList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabId = "all" | "incoming" | "outgoing";

interface TransactionHistorySectionProps {
  activities: RecentActivity[];
}

export function TransactionHistorySection({
  activities,
}: TransactionHistorySectionProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const filtered =
    activeTab === "all"
      ? activities
      : activeTab === "incoming"
        ? activities.filter((a) => a.type === "RECEIVE")
        : activities.filter((a) => a.type === "SEND");

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
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/20 py-8 text-center text-sm text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          filtered.map((activity) => (
            <RecentActivityItem
              key={activity.id}
              type={activity.type}
              username={activity.username}
              amount={activity.amount}
              token={activity.token}
              timestamp={activity.timestamp}
              isPrivate={activity.isPrivate}
            />
          ))
        )}
      </div>
    </div>
  );
}
