"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { Check, X, Loader2 } from "lucide-react";

import { PINInput } from "@/components/auth/PINInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsername } from "@/hooks/useUsername";
import { useWallet } from "@/hooks/useWallet";
import { deriveMetaKeys } from "@/lib/blockchain/meta-keys";
import { hashPIN, storePINHash } from "@/lib/utils/pin";
import { getOrCreateWalletSignature } from "@/lib/utils/wallet-signature";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [step, setStep] = useState<
    "username" | "pin" | "signing" | "registering"
  >("username");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { checkAvailability, isChecking, availability } = useUsername();
  const {
    signer,
    isConnected,
    address,
    walletAddress,
    isLoading: isWalletLoading,
  } = useWallet();

  // Debounced username availability check
  useEffect(() => {
    if (!username.trim() || username.length < 3) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const cleanUsername = username.replace(/^@+/, "");
      if (cleanUsername.length >= 3) {
        checkAvailability(cleanUsername);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkAvailability]);

  const validateUsername = (value: string): boolean => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setError("Please enter a username");
      return false;
    }

    const usernameWithoutAt = trimmedValue.replace(/^@+/, "");

    if (usernameWithoutAt.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameWithoutAt)) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }

    setError("");
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/^@+/, "");
    setUsername(value);
    if (error) {
      setError("");
    }
  };

  const handleUsernameSubmit = async (
    e?: React.FormEvent | React.MouseEvent
  ) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateUsername(username)) {
      return;
    }

    const cleanUsername = username.replace(/^@+/, "");

    if (availability === false) {
      setError("Username is already taken");
      return;
    }

    if (availability === null && !isChecking) {
      const isAvailable = await checkAvailability(cleanUsername);
      if (!isAvailable) {
        setError("Username is already taken");
        return;
      }
    }

    if (availability === true) {
      setStep("pin");
      setError("");
    }
  };

  const handlePINComplete = async (enteredPin: string) => {
    setStep("signing");
    setError("");

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

      const walletSignature = await getOrCreateWalletSignature(
        signer,
        walletAddr
      );

      setStep("registering");
      setIsLoading(true);

      const metaKeys = await deriveMetaKeys(
        walletAddr,
        walletSignature,
        enteredPin
      );

      const cleanUsername = username.replace(/^@+/, "");
      const authMessage = `Register @${cleanUsername} for ${walletAddr}`;
      const authSignature = await signer.signMessage(authMessage);

      const response = await fetch("/api/register-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          viewingKey: metaKeys.metaViewPub,
          walletAddress: walletAddr,
          signature: authSignature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      await response.json();

      storePINHash(hashPIN(enteredPin), walletAddr);

      localStorage.setItem(
        "cypher_keys",
        JSON.stringify({
          viewingKey: metaKeys.metaViewPub,
          viewingKeyPrivate: metaKeys.metaViewPriv,
          spendingKey: metaKeys.metaSpendPub,
          spendingKeyPrivate: metaKeys.metaSpendPriv,
        })
      );

      localStorage.setItem("cypher_username", `@${cleanUsername}`);

      router.push("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        if (err.message.includes("user rejected")) {
          setError("Transaction cancelled");
        } else if (err.message.includes("connect your wallet")) {
          setError("Wallet not connected. Please try logging in again.");
        } else if (err.message.includes("Rate limit")) {
          setError("Too many requests. Please try again later.");
        } else {
          setError(err.message || "Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
      setStep("pin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "pin") {
      setStep("username");
      setError("");
    } else if (step === "signing" || step === "registering") {
      setStep("pin");
      setError("");
    } else {
      router.back();
    }
  };

  if (step === "username") {
    return (
      <div className="flex flex-col justify-between items-center gap-4 text-center h-full w-full py-32 px-8">
        <div className="flex flex-col items-center gap-8 text-center w-full">
          <h1 className="text-3xl font-bold text-foreground text-left">
            Your private identity, your way
          </h1>
          <p className="text-base text-muted-foreground text-left">
            Create a unique username to receive crypto privately. Your identity
            stays hidden while you stay connected.
          </p>

          <form onSubmit={handleUsernameSubmit} className="space-y-6 w-full">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Username
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                  @
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="yourusername"
                  value={username}
                  onChange={handleInputChange}
                  onBlur={() => validateUsername(username)}
                  className={`pl-8 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  aria-invalid={!!error}
                  aria-describedby={error ? "username-error" : undefined}
                  disabled={isLoading || isWalletLoading}
                  autoComplete="username"
                />
              </div>
              <div className="flex items-center justify-between">
                {error && (
                  <p
                    id="username-error"
                    className="text-sm text-destructive text-left"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
                {username.length >= 3 && !error && (
                  <div className="flex items-center gap-2 text-sm">
                    {isChecking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Checking...
                        </span>
                      </>
                    ) : availability === true ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Available</span>
                      </>
                    ) : availability === false ? (
                      <>
                        <X className="h-4 w-4 text-destructive" />
                        <span className="text-destructive">Taken</span>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Button
            type="button"
            onClick={handleUsernameSubmit}
            className="w-full"
            disabled={
              isLoading ||
              isWalletLoading ||
              !username.trim() ||
              availability === false ||
              isChecking ||
              !isConnected ||
              (!address && !walletAddress)
            }
          >
            Continue
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (step === "pin") {
    return (
      <div className="flex flex-col justify-between items-center gap-4 text-center h-full w-full py-32 px-8">
        <div className="flex flex-col items-center gap-8 text-center w-full">
          <h1 className="text-3xl font-bold text-foreground text-left">
            Set Your PIN
          </h1>
          <p className="text-base text-muted-foreground text-left">
            Create a 6-digit PIN to secure your private keys. You&apos;ll need
            this PIN to recover your keys.
          </p>

          <div className="w-full">
            <PINInput
              onComplete={handlePINComplete}
              onError={setError}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p
              className="text-sm text-destructive text-left w-full"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 w-full">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleBack}
            disabled={isLoading}
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (step === "signing" || step === "registering") {
    return (
      <div className="flex flex-col justify-center items-center gap-4 text-center h-full w-full py-32 px-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          {step === "signing"
            ? "Signing Message..."
            : "Registering Username..."}
        </h1>
        <p className="text-base text-muted-foreground">
          {step === "signing"
            ? "Please approve the signature request in your wallet"
            : "Please wait while we register your username on the blockchain"}
        </p>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  return null;
}
