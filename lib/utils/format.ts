import { ethers } from "ethers";

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

export function formatBalance(amount: number | string): string {
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

export function formatCryptoAmount(
  amount: number | string,
  displayDecimals: number = 4,
  tokenDecimals: number = 18
): string {
  const amountStr = typeof amount === "string" ? amount : amount.toString();
  const trimmed = amountStr.trim();

  if (!trimmed || trimmed === "0" || trimmed === "0.0" || trimmed === "0.00") {
    return "0.00";
  }

  if (trimmed === "NaN" || trimmed === "Infinity") {
    return "0.00";
  }

  try {
    let formattedValue: string;

    if (
      !trimmed.includes(".") &&
      /^\d+$/.test(trimmed) &&
      trimmed.length > 10
    ) {
      formattedValue = ethers.formatUnits(trimmed, tokenDecimals);
    } else {
      const numValue = typeof amount === "string" ? parseFloat(amount) : amount;

      if (isNaN(numValue)) {
        return "0.00";
      }

      if (numValue === 0) {
        return "0.00";
      }

      formattedValue = numValue.toString();
    }

    const numFormatted = parseFloat(formattedValue);

    if (isNaN(numFormatted) || numFormatted === 0) {
      return "0.00";
    }

    if (numFormatted < 0.0001 && numFormatted > 0) {
      return "<0.0001";
    }

    if (numFormatted >= 1_000_000_000) {
      const billions = numFormatted / 1_000_000_000;
      return `${billions.toFixed(2)}B`;
    }

    if (numFormatted >= 1_000_000) {
      const millions = numFormatted / 1_000_000;
      return `${millions.toFixed(2)}M`;
    }

    if (numFormatted >= 1_000) {
      const thousands = numFormatted / 1_000;
      return `${thousands.toFixed(2)}K`;
    }

    // Use toFixed for proper rounding instead of string manipulation
    const rounded = numFormatted.toFixed(displayDecimals);
    const roundedNum = parseFloat(rounded);

    // If rounded to 0 but original was > 0, show <0.01 or similar
    if (roundedNum === 0 && numFormatted > 0) {
      if (numFormatted < 0.01) {
        return "<0.01";
      }
    }

    const dotIndex = rounded.indexOf(".");
    const integerPart =
      dotIndex === -1 ? rounded : rounded.substring(0, dotIndex);
    const decimalPart = dotIndex === -1 ? "" : rounded.substring(dotIndex + 1);

    const formattedInteger = parseFloat(integerPart).toLocaleString("en-US", {
      maximumFractionDigits: 0,
    });

    return `${formattedInteger}.${decimalPart}`;
  } catch {
    return "0.00";
  }
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
