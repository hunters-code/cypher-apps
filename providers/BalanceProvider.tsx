"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  ReactNode,
} from "react";

import type { Transaction } from "@/hooks/useTransactionHistory";
import type { BalanceState, TokenBalance } from "@/lib/schemas/balance";

interface BalanceContextType {
  state: BalanceState;
  calculateBalanceFromTransactions: (
    transactions: Transaction[],
    initialBalances: TokenBalance[]
  ) => void;
  updateBalance: (balances: TokenBalance[]) => void;
  resetBalance: () => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

const initialState: BalanceState = {
  balances: [],
  totalBalance: "0",
  lastCalculated: undefined,
  isLoading: false,
  error: null,
};

interface BalanceProviderProps {
  children: ReactNode;
}

export function BalanceProvider({ children }: BalanceProviderProps) {
  const [state, setState] = useState<BalanceState>(initialState);

  const calculateBalanceFromTransactions = useCallback(
    (transactions: Transaction[], baseBalances: TokenBalance[]) => {
      if (baseBalances.length === 0) {
        setState({
          balances: [],
          totalBalance: "0",
          lastCalculated: Date.now(),
          isLoading: false,
          error: null,
        });
        return;
      }

      const balanceMap = new Map<string, number>();

      baseBalances.forEach((balance) => {
        const amount = parseFloat(balance.amount) || 0;
        balanceMap.set(balance.symbol, amount);
      });

      transactions.forEach((tx) => {
        const symbol = tx.token.toUpperCase();
        if (!balanceMap.has(symbol)) {
          return;
        }

        const amount = parseFloat(tx.amount) || 0;
        const currentBalance = balanceMap.get(symbol) ?? 0;

        if (tx.type === "RECEIVE") {
          balanceMap.set(symbol, currentBalance + amount);
        } else if (tx.type === "SEND") {
          balanceMap.set(symbol, Math.max(0, currentBalance - amount));
        }
      });

      const calculatedBalances: TokenBalance[] = baseBalances.map((base) => {
        const calculatedAmount =
          balanceMap.get(base.symbol) ?? (parseFloat(base.amount) || 0);
        return {
          ...base,
          amount: calculatedAmount.toString(),
          lastUpdated: Date.now(),
        };
      });

      const totalBalance = Array.from(balanceMap.values()).reduce(
        (sum, amount) => sum + amount,
        0
      );

      setState({
        balances: calculatedBalances,
        totalBalance: totalBalance.toString(),
        lastCalculated: Date.now(),
        isLoading: false,
        error: null,
      });
    },
    []
  );

  const updateBalance = useCallback((balances: TokenBalance[]) => {
    const totalBalance = balances.reduce(
      (sum, balance) => sum + (parseFloat(balance.amount) || 0),
      0
    );

    setState({
      balances,
      totalBalance: totalBalance.toString(),
      lastCalculated: Date.now(),
      isLoading: false,
      error: null,
    });
  }, []);

  const resetBalance = useCallback(() => {
    setState(initialState);
  }, []);

  const value = useMemo(
    () => ({
      state,
      calculateBalanceFromTransactions,
      updateBalance,
      resetBalance,
    }),
    [state, calculateBalanceFromTransactions, updateBalance, resetBalance]
  );

  return (
    <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within BalanceProvider");
  }
  return context;
}
