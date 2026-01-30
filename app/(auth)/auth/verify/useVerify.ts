import { useState, useCallback, useEffect } from "react";

import { useRouter } from "next/navigation";

import {
  usePrivy,
  useLoginWithEmail,
  useCreateWallet,
  User,
} from "@privy-io/react-auth";

import { useAuth } from "@/hooks/useAuth";
import { useBaseProvider } from "@/hooks/useBlockchain";
import { getUsername } from "@/lib/blockchain";
import { ROUTES } from "@/lib/constants/routes";
import { saveSession, hasSession } from "@/lib/utils/session";

export function useVerify() {
  const router = useRouter();
  const { loginMethod, contactValue } = useAuth();
  const { ready } = usePrivy();
  const provider = useBaseProvider();
  const { createWallet } = useCreateWallet();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleCreateWallet = useCallback(async (): Promise<string | null> => {
    try {
      const newWallet = await createWallet();
      return newWallet.address;
    } catch {
      setError("Failed to create wallet. Please try again.");
      return null;
    }
  }, [createWallet]);

  const handleCheckUsername = useCallback(
    async (walletAddress: string): Promise<string | null> => {
      if (!provider) return null;

      try {
        const username = await getUsername(provider, walletAddress);
        if (username && username.length > 0) {
          localStorage.setItem("cypher_username", `@${username}`);
          return username;
        }
      } catch {
        return null;
      }

      return null;
    },
    [provider]
  );

  const handleLoginComplete = useCallback(
    async (params: { isNewUser: boolean; user: User }) => {
      let walletAddress: string | null | undefined =
        params?.user?.wallet?.address;

      if (!walletAddress && ready) {
        walletAddress = await handleCreateWallet();
        if (!walletAddress) return;
      }

      if (!walletAddress) {
        setError("Wallet address not available. Please try again.");
        return;
      }

      const registeredUsername = await handleCheckUsername(walletAddress);
      const hasUsername = Boolean(registeredUsername);

      if (params.isNewUser || !hasUsername) {
        router.push(ROUTES.ONBOARDING);
        return;
      }

      if (registeredUsername) {
        saveSession(walletAddress, `@${registeredUsername}`);
      }

      const keysData = localStorage.getItem("cypher_keys");
      if (!keysData) {
        router.push(ROUTES.RECOVER);
        return;
      }

      router.push(ROUTES.DASHBOARD);
    },
    [ready, handleCreateWallet, handleCheckUsername, router]
  );

  const {
    loginWithCode,
    sendCode: sendEmailCode,
    state,
  } = useLoginWithEmail({
    onComplete: handleLoginComplete,
    onError: (err) => {
      setError(err || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = useCallback(
    (e?: React.FormEvent | React.MouseEvent) => {
      e?.preventDefault();
      loginWithCode({ code: otp });
    },
    [otp, loginWithCode]
  );

  const handleResendOTP = useCallback(async () => {
    if (loginMethod === "email" && contactValue) {
      await sendEmailCode({ email: contactValue });
    }
  }, [loginMethod, contactValue, sendEmailCode]);

  useEffect(() => {
    if (!contactValue) {
      router.push(ROUTES.LOGIN);
    }
  }, [contactValue, router]);

  useEffect(() => {
    if (hasSession()) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [router]);

  return {
    otp,
    setOtp,
    error,
    loginMethod,
    contactValue,
    state,
    handleSubmit,
    handleResendOTP,
  };
}
