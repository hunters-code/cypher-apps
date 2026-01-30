import { useEffect, useMemo } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";

import type { Asset } from "@/components/wallet/AssetList";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useWallet } from "@/hooks/useWallet";
import { ROUTES } from "@/lib/constants/routes";
import { AVAILABLE_TOKENS } from "@/lib/constants/tokens";
import { formatCryptoAmount } from "@/lib/utils/format";
import { getSessionUsername, hasSession } from "@/lib/utils/session";

export function useDashboard() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const { address, walletAddress } = useWallet();
  const { balances, isLoading } = useTokenBalances();

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

  const username = useMemo(() => {
    const sessionUsername = getSessionUsername();
    if (sessionUsername) {
      return sessionUsername;
    }
    const storedUsername = localStorage.getItem("cypher_username");
    return storedUsername || "";
  }, []);

  const assets: Asset[] = useMemo(() => {
    return AVAILABLE_TOKENS.map((token) => {
      const balance = balances.find((b) => b.symbol === token.symbol);

      if (!balance) {
        return {
          symbol: token.symbol,
          name: token.name,
          amount: formatCryptoAmount("0", 2, token.decimals),
          usdValue: "0",
          logoURI: token.logoURI,
        };
      }

      return {
        symbol: token.symbol,
        name: token.name,
        amount: formatCryptoAmount(balance.amount, 2, token.decimals),
        usdValue: "0",
        logoURI: token.logoURI,
      };
    });
  }, [balances]);

  const totalBalance = useMemo(() => {
    const total = balances.reduce((sum, balance) => {
      const amount = parseFloat(balance.amount) || 0;
      return sum + amount;
    }, 0);
    return formatCryptoAmount(total.toString(), 2);
  }, [balances]);

  const shouldRender = ready && authenticated && hasSession();

  return {
    username,
    totalBalance,
    isLoading,
    assets,
    shouldRender,
  };
}
