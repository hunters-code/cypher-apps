import { useCallback, useEffect, useState } from "react";

import { useBaseProvider } from "@/hooks/useBlockchain";
import { useWallet } from "@/hooks/useWallet";
import { getMultipleTokenBalancesWithStealth } from "@/lib/blockchain/tokens";
import { AVAILABLE_TOKENS } from "@/lib/constants/tokens";

export interface TokenBalance {
  symbol: string;
  name: string;
  amount: string;
  decimals: number;
}

export function useTokenBalances(): {
  balances: TokenBalance[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const provider = useBaseProvider();
  const { address } = useWallet();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getViewingKeyPrivate = useCallback((): string | null => {
    if (typeof window === "undefined") return null;

    try {
      const keysData = localStorage.getItem("cypher_keys");
      if (!keysData) return null;

      const keys = JSON.parse(keysData) as {
        viewingKeyPrivate?: string;
      };
      return keys.viewingKeyPrivate || null;
    } catch {
      return null;
    }
  }, []);

  const fetchBalances = useCallback(async () => {
    if (!provider || !address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const viewingKeyPrivate = getViewingKeyPrivate();

      const balanceMap = await getMultipleTokenBalancesWithStealth(
        provider,
        AVAILABLE_TOKENS,
        address,
        viewingKeyPrivate
      );

      const balanceList: TokenBalance[] = AVAILABLE_TOKENS.map((token) => ({
        symbol: token.symbol,
        name: token.name,
        amount: balanceMap[token.symbol] || "0",
        decimals: token.decimals,
      }));

      setBalances(balanceList);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch balances";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [provider, address, getViewingKeyPrivate]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances,
  };
}
