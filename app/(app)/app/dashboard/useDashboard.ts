import { useEffect, useMemo } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";

import type { Asset } from "@/components/wallet/AssetList";
import { useBalanceCalculation } from "@/hooks/useBalanceCalculation";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { useWallet } from "@/hooks/useWallet";
import { ROUTES } from "@/lib/constants/routes";
import { AVAILABLE_TOKENS } from "@/lib/constants/tokens";
import type { TokenBalance } from "@/lib/schemas/balance";
import { formatCryptoAmount } from "@/lib/utils/format";
import { getSessionUsername, hasSession } from "@/lib/utils/session";
import { calculateUSDValue } from "@/lib/utils/tokenPrice";

export function useDashboard() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const { address, walletAddress } = useWallet();
  const { balances: baseBalances, isLoading: balancesLoading } =
    useTokenBalances();
  const { transactions, isLoading: transactionsLoading } =
    useTransactionHistory();
  const { prices: tokenPrices, isLoading: pricesLoading } =
    useTokenPrices(AVAILABLE_TOKENS);

  const calculatedBalance = useBalanceCalculation({
    transactions,
    baseBalances,
    isLoading: balancesLoading || transactionsLoading,
  });

  const balances = useMemo(() => {
    if (balancesLoading || transactionsLoading || baseBalances.length === 0) {
      return baseBalances;
    }

    if (calculatedBalance.balances.length === 0) {
      return baseBalances;
    }

    const balanceMap = new Map<string, TokenBalance>();

    baseBalances.forEach((balance) => {
      balanceMap.set(balance.symbol, balance);
    });

    calculatedBalance.balances.forEach((calculated) => {
      balanceMap.set(calculated.symbol, calculated);
    });

    return Array.from(balanceMap.values());
  }, [
    baseBalances,
    calculatedBalance.balances,
    balancesLoading,
    transactionsLoading,
  ]);

  const isLoading = balancesLoading || transactionsLoading || pricesLoading;

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

      const priceUSD = tokenPrices[token.symbol];
      const usdValue = calculateUSDValue(balance.amount, token, priceUSD);
      const formattedAmount = formatCryptoAmount(
        balance.amount,
        2,
        token.decimals
      );

      return {
        symbol: token.symbol,
        name: token.name,
        amount: formattedAmount,
        usdValue,
        logoURI: token.logoURI,
      };
    });
  }, [balances, tokenPrices]);

  const totalBalance = useMemo(() => {
    const tradableTokens = AVAILABLE_TOKENS.filter((t) => t.tradable);
    const totalUSD = balances.reduce((sum, balance) => {
      const token = tradableTokens.find((t) => t.symbol === balance.symbol);
      if (!token) {
        return sum;
      }

      const priceUSD = tokenPrices[token.symbol] ?? 0;
      const amount = parseFloat(balance.amount) || 0;
      const usdValue = amount * priceUSD;
      return sum + usdValue;
    }, 0);

    return totalUSD.toFixed(2);
  }, [balances, tokenPrices]);

  const shouldRender = ready && authenticated && hasSession();

  return {
    username,
    totalBalance,
    isLoading,
    assets,
    shouldRender,
  };
}
