import { formatCurrency } from "@/lib/utils/format";

interface BalanceDisplayProps {
  totalBalance: string | number;
  currency?: string;
}

export function BalanceDisplay({ totalBalance, currency = "USD" }: BalanceDisplayProps) {
  const formattedBalance = formatCurrency(totalBalance, currency);

  return (
    <div className="space-y-2 text-left p-6 rounded-xl bg-gradient-to-br from-primary/80 via-primary/70 to-primary text-white">
      <p className="text-sm">Total Balance</p>
      <p className="text-3xl font-bold">{formattedBalance}</p>
    </div>
  );
}

