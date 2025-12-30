/**
 * Hook for blockchain interactions
 * Provides provider and signer utilities
 */

import { useMemo } from "react";

import { ethers } from "ethers";

import { BASE_CHAIN_ID } from "@/lib/constants";

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      isMetaMask?: boolean;
    };
  }
}

/**
 * Get a provider for Base L2
 */
export function useBaseProvider(): ethers.JsonRpcProvider | null {
  return useMemo(() => {
    if (typeof window === "undefined") return null;

    const rpcUrl =
      process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org";

    try {
      return new ethers.JsonRpcProvider(rpcUrl, BASE_CHAIN_ID);
    } catch {
      return null;
    }
  }, []);
}

/**
 * Get a browser provider (for wallet connections)
 */
export function useBrowserProvider(): ethers.BrowserProvider | null {
  return useMemo(() => {
    if (typeof window === "undefined" || !window.ethereum) return null;

    try {
      return new ethers.BrowserProvider(window.ethereum, BASE_CHAIN_ID);
    } catch {
      return null;
    }
  }, []);
}

/**
 * Get a signer from browser provider
 */
export async function getSigner(): Promise<ethers.JsonRpcSigner | null> {
  if (typeof window === "undefined" || !window.ethereum) return null;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum, BASE_CHAIN_ID);
    const signer = await provider.getSigner();
    return signer;
  } catch {
    return null;
  }
}
