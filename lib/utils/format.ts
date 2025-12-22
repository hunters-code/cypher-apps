export function formatCurrency(
  amount: number | string,
  currency: string = "USD",
  options?: Intl.NumberFormatOptions
): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return `$0.00 ${currency}`;
  }

  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  };

  const formatter = new Intl.NumberFormat("en-US", defaultOptions);
  return formatter.format(numAmount);
}

export function formatBalance(amount: number | string, currency: string = "USD"): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "0.00";
  }

  if (numAmount >= 1000000) {
    return (numAmount / 1000000).toFixed(2) + "M";
  }

  if (numAmount >= 1000) {
    return (numAmount / 1000).toFixed(2) + "K";
  }

  return numAmount.toFixed(2);
}

export function formatCryptoAmount(amount: number | string, decimals: number = 4): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "0.00";
  }

  if (numAmount === 0) {
    return "0.00";
  }

  if (numAmount < 0.0001) {
    return "<0.0001";
  }

  return numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

export function formatUSDValue(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

