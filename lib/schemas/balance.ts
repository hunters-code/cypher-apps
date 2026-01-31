export interface TokenBalance {
  symbol: string;
  name: string;
  amount: string;
  decimals: number;
  lastUpdated?: number;
}

export interface BalanceState {
  balances: TokenBalance[];
  totalBalance: string;
  lastCalculated?: number;
  isLoading: boolean;
  error: string | null;
}
