"use client";

import { useEffect, useMemo } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";

import { Header } from "@/components/layout/Header";
import { RecentActivityList } from "@/components/transaction/RecentActivityList";
import { ActionsButton } from "@/components/wallet/ActionsButton";
import { AssetList, type Asset } from "@/components/wallet/AssetList";
import { BalanceDisplay } from "@/components/wallet/BalanceDisplay";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useWallet } from "@/hooks/useWallet";
import { ROUTES } from "@/lib/constants/routes";
import { formatCryptoAmount } from "@/lib/utils/format";
import { hasSession } from "@/lib/utils/session";

const CDT_TOKEN_SYMBOLS = ["CDT"];

export default function DashboardPage() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const { address, walletAddress } = useWallet();
  const { balances, isLoading } = useTokenBalances(CDT_TOKEN_SYMBOLS);

  useEffect(() => {
    if (ready && (!authenticated || !hasSession())) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (ready && authenticated && hasSession()) {
      const walletAddr = address || walletAddress;
      if (walletAddr) {
        const keysData = localStorage.getItem("cypher_keys");
        if (!keysData) {
          router.push(ROUTES.RECOVER);
        }
      }
    }
  }, [ready, authenticated, address, walletAddress, router]);

  const assets: Asset[] = useMemo(() => {
    return balances
      .filter((balance) => parseFloat(balance.amount) > 0)
      .map((balance) => ({
        symbol: balance.symbol,
        name: balance.name,
        amount: formatCryptoAmount(balance.amount, 4),
        usdValue: "0",
      }));
  }, [balances]);

  const totalBalance = useMemo(() => {
    const cdtBalance = balances.find((b) => b.symbol === "CDT");
    if (cdtBalance) {
      return formatCryptoAmount(cdtBalance.amount, 2);
    }
    return "0.00";
  }, [balances]);

  if (ready && (!authenticated || !hasSession())) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 h-full w-full py-16 px-8">
      <Header username="@nashirjamali" />
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
