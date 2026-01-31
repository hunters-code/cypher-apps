import { useMemo } from "react";

import { ethers } from "ethers";

import { BASE_CHAIN_ID } from "@/lib/constants";

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

export function useBrowserProvider(): ethers.BrowserProvider | null {
  return useMemo(() => {
    if (typeof window === "undefined" || !window.ethereum) return null;

    try {
      return new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider,
        BASE_CHAIN_ID
      );
    } catch {
      return null;
    }
  }, []);
}

export async function getSigner(): Promise<ethers.JsonRpcSigner | null> {
  if (typeof window === "undefined") return null;

  if (window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider,
        BASE_CHAIN_ID
      );
      const signer = await provider.getSigner();
      return signer;
    } catch {}
  }

  return null;
}

export async function getSignerFromProvider(
  provider: ethers.Provider
): Promise<ethers.Signer | null> {
  try {
    if (provider instanceof ethers.BrowserProvider) {
      return await provider.getSigner();
    }
    return null;
  } catch {
    return null;
  }
}
