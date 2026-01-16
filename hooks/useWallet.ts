/**
 * Hook for Privy wallet integration with ethers.js
 */

import { useEffect, useState } from "react";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";

import { BASE_CHAIN_ID } from "@/lib/constants";

export function useWallet() {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    async function setupWallet() {
      if (!authenticated || !wallets || wallets.length === 0) {
        setProvider(null);
        setSigner(null);
        setAddress(null);
        return;
      }

      try {
        // Get the first wallet (embedded wallet)
        const wallet = wallets[0];
        const walletProvider = await wallet.getEthereumProvider();

        if (!walletProvider) {
          console.error("No Ethereum provider found");
          return;
        }

        // Create ethers provider
        const ethersProvider = new ethers.BrowserProvider(
          walletProvider,
          BASE_CHAIN_ID
        );

        setProvider(ethersProvider);

        // Get signer
        const ethersSigner = await ethersProvider.getSigner();
        setSigner(ethersSigner);

        // Get address
        const signerAddress = await ethersSigner.getAddress();
        setAddress(signerAddress);
      } catch (error) {
        console.error("Error setting up wallet:", error);
      }
    }

    setupWallet();
  }, [authenticated, wallets]);

  return {
    provider,
    signer,
    address,
    walletAddress: user?.wallet?.address || address,
    isConnected: authenticated && !!signer,
  };
}
