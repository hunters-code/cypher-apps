"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";

import { Header } from "@/components/layout/Header";
import { RecentActivityList } from "@/components/transaction/RecentActivityList";
import { ActionsButton } from "@/components/wallet/ActionsButton";
import { AssetList } from "@/components/wallet/AssetList";
import { BalanceDisplay } from "@/components/wallet/BalanceDisplay";
import { hasSession } from "@/lib/utils/session";

export default function DashboardPage() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();

  useEffect(() => {
    if (ready && (!authenticated || !hasSession())) {
      router.push("/auth");
    }
  }, [ready, authenticated, router]);

  if (ready && (!authenticated || !hasSession())) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 h-full w-full py-16 px-8">
      <Header username="@nashirjamali" />
      <BalanceDisplay totalBalance="1000000" />
      <ActionsButton />
      <AssetList
        assets={[
          {
            symbol: "ETH",
            name: "Ethereum",
            amount: "1.0",
            usdValue: "1000",
          },
          {
            symbol: "BTC",
            name: "Bitcoin",
            amount: "0.01",
            usdValue: "100000",
          },
          {
            symbol: "USDC",
            name: "USDC",
            amount: "1000",
            usdValue: "1000",
          },
        ]}
      />
      <RecentActivityList
        activities={[
          {
            id: "1",
            type: "SEND",
            username: "nashirjamali",
            amount: "1.0",
            token: "ETH",
            timestamp: "2025-01-01",
            isPrivate: false,
          },
          {
            id: "2",
            type: "RECEIVE",
            username: "nashirjamali",
            amount: "1.0",
            token: "ETH",
            timestamp: "2025-01-01",
            isPrivate: false,
          },
        ]}
      />
    </div>
  );
}
