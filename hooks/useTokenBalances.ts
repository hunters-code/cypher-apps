import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useBaseProvider } from "@/hooks/useBlockchain";
import { useWallet } from "@/hooks/useWallet";
import {
  BASE_TOKENS,
  getMultipleTokenBalancesWithStealth,
  type TokenInfo,
} from "@/lib/blockchain/tokens";

export interface TokenBalance {
  symbol: string;
  name: string;
  amount: string;
  decimals: number;
}

export function useTokenBalances(tokenSymbols: string[] = ["ETH", "USDC"]): {
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

  const tokenSymbolsString = useMemo(
    () => JSON.stringify([...tokenSymbols].sort()),
    [tokenSymbols]
  );
  const tokenSymbolsRef = useRef(tokenSymbolsString);

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
      const currentSymbols = JSON.parse(tokenSymbolsRef.current) as string[];
      const tokens: TokenInfo[] = currentSymbols
        .map((symbol) => BASE_TOKENS[symbol])
        .filter((token): token is TokenInfo => token !== undefined);

      const viewingKeyPrivate = getViewingKeyPrivate();

      const lastScannedBlock = localStorage.getItem("lastScannedBlock");
      const fromBlock = lastScannedBlock ? Number(lastScannedBlock) : 0;

      const balanceMap = await getMultipleTokenBalancesWithStealth(
        provider,
        tokens,
        address,
        viewingKeyPrivate,
        fromBlock
      );

      const balanceList: TokenBalance[] = tokens.map((token) => ({
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
      console.error("Error fetching token balances:", err);
    } finally {
      setIsLoading(false);
    }
  }, [provider, address, getViewingKeyPrivate]);

  useEffect(() => {
    if (tokenSymbolsRef.current !== tokenSymbolsString) {
      tokenSymbolsRef.current = tokenSymbolsString;
    }
  }, [tokenSymbolsString]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances, tokenSymbolsString]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances,
  };
}
