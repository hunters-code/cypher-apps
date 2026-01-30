"use client";

import { Header } from "@/components/layout/Header";
import { RecentActivityList } from "@/components/transaction/RecentActivityList";
import { ActionsButton } from "@/components/wallet/ActionsButton";
import { AssetList } from "@/components/wallet/AssetList";
import { BalanceDisplay } from "@/components/wallet/BalanceDisplay";

import { useDashboard } from "./useDashboard";

export default function DashboardPage() {
  const { username, totalBalance, isLoading, assets, shouldRender } =
    useDashboard();

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 h-full w-full py-16 px-8">
      <Header username={username} />
      <BalanceDisplay totalBalance={isLoading ? "0.00" : totalBalance} />
      <ActionsButton />
      <AssetList assets={isLoading ? [] : assets} />
      <RecentActivityList
        activities={[
          {
            id: "1",
            type: "SEND",
            username: "nashirjamali",
            amount: "1.0",
            token: "CDT",
            timestamp: "2025-01-01",
            isPrivate: false,
          },
          {
            id: "2",
            type: "RECEIVE",
            username: "nashirjamali",
            amount: "1.0",
            token: "CDT",
            timestamp: "2025-01-01",
            isPrivate: false,
          },
        ]}
      />
    </div>
  );
}
