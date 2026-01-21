"use client";

import { useState, useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { registerUsername } from "@/lib/blockchain";
import {
  getPendingRegistrationByUsername,
  markPendingRegistrationAsCompleted,
} from "@/lib/supabase/pending-registration";
import type { PendingRegistration } from "@/types/pending-registration";

export default function CompleteRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const { signer, address, isConnected } = useWallet();

  const [pendingRegistration, setPendingRegistration] =
    useState<PendingRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadPendingRegistration() {
      if (!username) {
        setError("Username parameter is missing");
        setIsLoading(false);
        return;
      }

      try {
        const pending = await getPendingRegistrationByUsername(username);
        if (!pending) {
          setError("Pending registration not found or has expired");
          setIsLoading(false);
          return;
        }

        if (pending.wallet_address.toLowerCase() !== address?.toLowerCase()) {
          setError("This registration belongs to a different wallet");
          setIsLoading(false);
          return;
        }

        const expiresAt = new Date(pending.expires_at);
        if (expiresAt < new Date()) {
          setError("This registration has expired");
          setIsLoading(false);
          return;
        }

        setPendingRegistration(pending);
      } catch (err) {
        console.error("Error loading pending registration:", err);
        setError("Failed to load pending registration");
      } finally {
        setIsLoading(false);
      }
    }

    if (username && address) {
      loadPendingRegistration();
    }
  }, [username, address]);

  const handleCompleteRegistration = async () => {
    if (!pendingRegistration || !signer) {
      setError("Missing required information");
      return;
    }

    setIsCompleting(true);
    setError("");

    try {
      await registerUsername(
        signer,
        pendingRegistration.username,
        pendingRegistration.viewing_key
      );

      await markPendingRegistrationAsCompleted(pendingRegistration.username);

      localStorage.setItem(
        "cypher_keys",
        JSON.stringify({
          viewingKey: pendingRegistration.viewing_key,
          viewingKeyPrivate: pendingRegistration.viewing_key_private,
          spendingKey: pendingRegistration.spending_key,
          spendingKeyPrivate: pendingRegistration.spending_key_private,
        })
      );

      localStorage.setItem(
        "cypher_username",
        `@${pendingRegistration.username}`
      );

      setSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error completing registration:", err);
      if (err instanceof Error) {
        if (err.message.includes("user rejected")) {
          setError("Transaction cancelled");
        } else if (
          err.message.includes("insufficient funds") ||
          err.message.includes("insufficient balance")
        ) {
          setError(
            "Insufficient balance for gas fees. Please add ETH to your wallet."
          );
        } else {
          setError(err.message || "Failed to complete registration");
        }
      } else {
        setError("Failed to complete registration");
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const getExpiryDate = (): string => {
    if (!pendingRegistration) return "";
    const expiresAt = new Date(pendingRegistration.expires_at);
    return expiresAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (): number => {
    if (!pendingRegistration) return 0;
    const expiresAt = new Date(pendingRegistration.expires_at);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-full w-full py-32 px-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading registration...</p>
      </div>
    );
  }

  if (error && !pendingRegistration) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 h-full w-full py-32 px-8">
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="secondary" onClick={() => router.push("/onboarding")}>
          Back to Registration
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 h-full w-full py-32 px-8">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
        <h1 className="text-3xl font-bold text-foreground">
          Registration Complete!
        </h1>
        <p className="text-base text-muted-foreground text-center">
          Your username @{pendingRegistration?.username} has been successfully
          registered on the blockchain.
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between items-center gap-6 h-full w-full py-32 px-8">
      <div className="flex flex-col items-center gap-6 text-center w-full">
        <h1 className="text-3xl font-bold text-foreground">
          Complete Your Registration
        </h1>
        <p className="text-base text-muted-foreground">
          You have a pending registration for{" "}
          <span className="font-semibold">
            @{pendingRegistration?.username}
          </span>
        </p>

        <div className="w-full max-w-md space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pending Registration</AlertTitle>
            <AlertDescription>
              Your username is reserved for {getDaysRemaining()} more days
              (until {getExpiryDate()}). Complete your registration by paying
              the gas fee to register on the blockchain.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isConnected && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Wallet Not Connected</AlertTitle>
              <AlertDescription>
                Please connect your wallet to complete the registration.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button
          type="button"
          onClick={handleCompleteRegistration}
          className="w-full"
          disabled={isCompleting || !isConnected || !pendingRegistration}
        >
          {isCompleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Completing Registration...
            </>
          ) : (
            "Complete Registration"
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => router.push("/onboarding")}
          disabled={isCompleting}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
