"use client";

import { useCallback, useEffect, useState } from "react";

import type { AvailableToken } from "@/lib/constants/tokens";

interface TokenPrice {
  symbol: string;
  priceUSD: number;
  lastUpdated: number;
}

const PRICE_CACHE_KEY = "cypher_token_prices";
const CACHE_DURATION = 5 * 60 * 1000;

async function fetchPriceFromCoinGecko(symbol: string): Promise<number | null> {
  const coinGeckoIds: Record<string, string> = {
    ETH: "ethereum",
    USDC: "usd-coin",
    WETH: "weth",
  };

  const coinId = coinGeckoIds[symbol.toUpperCase()];
  if (!coinId) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data[coinId]?.usd || null;
  } catch {
    return null;
  }
}

async function fetchPriceFromCoinMarketCap(
  symbol: string
): Promise<number | null> {
  const apiKey = process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbol}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const quote = data.data?.[symbol.toUpperCase()]?.quote?.USD;
    return quote?.price || null;
  } catch {
    return null;
  }
}

function getCachedPrices(): Record<string, TokenPrice> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const cached = localStorage.getItem(PRICE_CACHE_KEY);
    if (!cached) {
      return {};
    }

    const prices = JSON.parse(cached) as Record<string, TokenPrice>;
    const now = Date.now();

    const validPrices: Record<string, TokenPrice> = {};
    Object.entries(prices).forEach(([symbol, price]) => {
      if (now - price.lastUpdated < CACHE_DURATION) {
        validPrices[symbol] = price;
      }
    });

    return validPrices;
  } catch {
    return {};
  }
}

function setCachedPrice(symbol: string, price: number): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const cached = getCachedPrices();
    cached[symbol] = {
      symbol,
      priceUSD: price,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cached));
  } catch {}
}

export function useTokenPrices(tokens: AvailableToken[]): {
  prices: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cachedPrices = getCachedPrices();
      const priceMap: Record<string, number> = {};
      const tokensToFetch: AvailableToken[] = [];

      tokens.forEach((token) => {
        if (!token.tradable) {
          priceMap[token.symbol] = 0;
          return;
        }

        const cached = cachedPrices[token.symbol];
        if (cached) {
          priceMap[token.symbol] = cached.priceUSD;
        } else {
          tokensToFetch.push(token);
        }
      });

      if (tokensToFetch.length > 0) {
        await Promise.all(
          tokensToFetch.map(async (token) => {
            try {
              let price: number | null = null;

              price = await fetchPriceFromCoinGecko(token.symbol);

              if (!price) {
                price = await fetchPriceFromCoinMarketCap(token.symbol);
              }

              if (price && price > 0) {
                priceMap[token.symbol] = price;
                setCachedPrice(token.symbol, price);
              } else {
                priceMap[token.symbol] = 0;
              }
            } catch {
              priceMap[token.symbol] = 0;
            }
          })
        );
      }

      setPrices(priceMap);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch token prices";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tokens]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return {
    prices,
    isLoading,
    error,
    refetch: fetchPrices,
  };
}
