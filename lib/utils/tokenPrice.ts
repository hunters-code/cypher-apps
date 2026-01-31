import type { AvailableToken } from "@/lib/constants/tokens";

export function calculateUSDValue(
  amount: number | string,
  token?: AvailableToken,
  priceUSD?: number
): string {
  if (!token || !token.tradable) {
    return "0";
  }

  const price = priceUSD ?? token.priceUSD ?? 0;
  if (!price || price <= 0) {
    return "0";
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === 0) {
    return "0";
  }

  const usdValue = numAmount * price;
  return usdValue.toFixed(2);
}

export function getTokenPriceOrZero(
  token?: AvailableToken,
  priceUSD?: number
): number {
  if (!token || !token.tradable) {
    return 0;
  }
  return priceUSD ?? token.priceUSD ?? 0;
}
