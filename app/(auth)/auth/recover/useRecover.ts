import { useState, useCallback, useEffect } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";

import { useBaseProvider } from "@/hooks/useBlockchain";
import { useWallet } from "@/hooks/useWallet";
import { recoverMetaKeys } from "@/lib/blockchain/recovery";
import { ROUTES } from "@/lib/constants/routes";
import { hasSession, getSession } from "@/lib/utils/session";

export function useRecover() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();
  const {
    signer,
    address,
    walletAddress,
    isLoading: isWalletLoading,
  } = useWallet();
  const baseProvider = useBaseProvider();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!authenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (hasSession()) {
      const session = getSession();
      const walletAddr = address || walletAddress;

      if (session && walletAddr) {
        const keysData = localStorage.getItem("cypher_keys");
        if (keysData) {
          router.push(ROUTES.DASHBOARD);
          return;
        }
      }
    }
  }, [ready, authenticated, address, walletAddress, router]);

  const handlePINComplete = useCallback(
    async (enteredPin: string) => {
      setError("");
      setIsLoading(true);

      try {
        if (!signer) {
          throw new Error("Please connect your wallet first");
        }

        const walletAddr = address || walletAddress;
        if (!walletAddr) {
          throw new Error(
            "Wallet address not found. Please ensure you are logged in."
          );
        }

        if (!baseProvider) {
          throw new Error("Provider not available");
        }

        const metaKeys = await recoverMetaKeys(
          walletAddr,
          enteredPin,
          signer,
          baseProvider
        );

        localStorage.setItem(
          "cypher_keys",
          JSON.stringify({
            viewingKey: metaKeys.metaViewPub,
            viewingKeyPrivate: metaKeys.metaViewPriv,
            spendingKey: metaKeys.metaSpendPub,
            spendingKeyPrivate: metaKeys.metaSpendPriv,
          })
        );

        const session = getSession();
        if (session) {
          localStorage.setItem("cypher_username", session.username);
        }

        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes("user rejected")) {
            setError("Transaction cancelled");
          } else if (err.message.includes("PIN is invalid")) {
            setError("Invalid PIN. Please try again.");
          } else if (err.message.includes("Wallet is locked")) {
            setError(err.message);
          } else if (err.message.includes("connect your wallet")) {
            setError("Wallet not connected. Please try logging in again.");
          } else if (
            err.message.includes("network changed") ||
            err.message.includes("NETWORK_ERROR")
          ) {
            setError("Network changed. Please try again.");
          } else {
            setError(err.message || "Something went wrong. Please try again.");
          }
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [signer, address, walletAddress, router, baseProvider]
  );

  const handleBack = useCallback(() => {
    router.push(ROUTES.LOGIN);
  }, [router]);

  const shouldRender = ready && authenticated && !isWalletLoading;

  return {
    error,
    isLoading,
    shouldRender,
    handlePINComplete,
    handleBack,
    setError,
  };
}
