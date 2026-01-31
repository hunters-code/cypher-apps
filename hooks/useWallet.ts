import { useEffect, useState } from "react";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";

import { BASE_CHAIN_ID } from "@/lib/constants";

export function useWallet() {
  const { authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function setupWallet() {
      setIsLoading(true);

      if (!ready) {
        return;
      }

      if (!authenticated) {
        setProvider(null);
        setSigner(null);
        setAddress(null);
        setIsLoading(false);
        return;
      }

      const walletAddress = user?.wallet?.address;

      if (!walletAddress) {
        setProvider(null);
        setSigner(null);
        setAddress(null);
        setIsLoading(false);
        return;
      }

      setAddress(walletAddress);

      if (!wallets || wallets.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const wallet = wallets[0];
        const walletProvider = await wallet.getEthereumProvider();

        if (!walletProvider) {
          setIsLoading(false);
          return;
        }

        const ethersProvider = new ethers.BrowserProvider(
          walletProvider,
          BASE_CHAIN_ID
        );

        setProvider(ethersProvider);

        const ethersSigner = await ethersProvider.getSigner();
        setSigner(ethersSigner);

        const signerAddress = await ethersSigner.getAddress();
        if (signerAddress !== walletAddress) {
          setAddress(signerAddress);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }

    setupWallet();
  }, [authenticated, wallets, user, ready]);

  return {
    provider,
    signer,
    address: address || user?.wallet?.address || null,
    walletAddress: user?.wallet?.address || address || null,
    isConnected: authenticated && !!signer && !!address,
    isLoading,
    ready,
  };
}
