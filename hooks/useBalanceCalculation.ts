"use client";

import { useEffect } from "react";

import type { TokenBalance } from "@/lib/schemas/balance";
import { useBalance } from "@/providers/BalanceProvider";

import type { Transaction } from "./useTransactionHistory";

interface UseBalanceCalculationProps {
  transactions: Transaction[];
  baseBalances: TokenBalance[];
  isLoading?: boolean;
}

export function useBalanceCalculation({
  transactions,
  baseBalances,
  isLoading = false,
}: UseBalanceCalculationProps) {
  const { calculateBalanceFromTransactions, state } = useBalance();

  useEffect(() => {
    if (!isLoading && baseBalances.length > 0) {
      calculateBalanceFromTransactions(transactions, baseBalances);
    }
  }, [transactions, baseBalances, isLoading, calculateBalanceFromTransactions]);

  return state;
}
