"use client";

import { PersonalLinkCard } from "@/components/dashboard/personal-link-card";
import { StealthBalancesCard } from "@/components/dashboard/stealth-balances-card";
import { TransactionHistorySection } from "@/components/dashboard/transaction-history-section";

import { useDashboard } from "./useDashboard";

const SAMPLE_ACTIVITIES = [
  {
    id: "1",
    type: "SEND" as const,
    username: "nashirjamali",
    amount: "1.0",
    token: "CDT",
    timestamp: "2025-01-01",
    isPrivate: false,
  },
  {
    id: "2",
    type: "RECEIVE" as const,
    username: "nashirjamali",
    amount: "1.0",
    token: "CDT",
    timestamp: "2025-01-01",
    isPrivate: false,
  },
];

export default function DashboardPage() {
  const { username, totalBalance, isLoading, assets, shouldRender } =
    useDashboard();

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8 lg:px-10">
      <h1 className="text-center font-urbanist text-2xl font-bold text-foreground md:text-left md:text-3xl">
        Dashboard
      </h1>

      <StealthBalancesCard
        totalBalance={isLoading ? "0.00" : totalBalance}
        assets={isLoading ? [] : assets}
        currency="USD"
        showDemoAlert
      />

      <PersonalLinkCard username={username || "username"} />

      <TransactionHistorySection activities={SAMPLE_ACTIVITIES} />
    </div>
  );
}
