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
 * Get a signer from Privy embedded wallet
 * To use this function, import it in a component that has access to Privy hooks
 */
export async function getSigner(): Promise<ethers.JsonRpcSigner | null> {
  if (typeof window === "undefined") return null;

  // First try window.ethereum (for Privy embedded wallets)
  if (window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(
        window.ethereum,
        BASE_CHAIN_ID
      );
      const signer = await provider.getSigner();
      return signer;
    } catch (error) {
      console.error("Error getting signer from window.ethereum:", error);
    }
  }

  return null;
}

/**
 * Get a signer from a Privy wallet provider
 * Use this when you have access to Privy's wallet provider
 */
export async function getSignerFromProvider(
  provider: ethers.Provider
): Promise<ethers.Signer | null> {
  try {
    if (provider instanceof ethers.BrowserProvider) {
      return await provider.getSigner();
    }
    // If it's a JsonRpcProvider, we can't get a signer directly
    return null;
  } catch (error) {
    console.error("Error getting signer from provider:", error);
    return null;
  }
}
