"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { Check, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSigner } from "@/hooks/useBlockchain";
import { useUsername } from "@/hooks/useUsername";
import { generateStealthKeys, registerUsername } from "@/lib/blockchain";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  const { checkAvailability, isChecking, availability } = useUsername();

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

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateUsername(username)) {
      return;
    }

    const cleanUsername = username.replace(/^@+/, "");

    // Check availability first
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

    setIsLoading(true);
    setIsGeneratingKeys(true);
    setError("");

    try {
      // Should we send OTP to email from from here instead?

      // Step 1: Generate stealth keys
      const keys = await generateStealthKeys();

      // Step 2: Get signer
      const signer = await getSigner();
      if (!signer) {
        throw new Error("Please connect your wallet");
      }

      setIsGeneratingKeys(false);

      // Step 3: Register username on blockchain
      await registerUsername(signer, cleanUsername, keys.viewingKey);

      // Step 4: Store keys securely (in production, encrypt these)
      localStorage.setItem(
        "cypher_keys",
        JSON.stringify({
          viewingKey: keys.viewingKey,
          viewingKeyPrivate: keys.viewingKeyPrivate,
          spendingKey: keys.spendingKey,
          spendingKeyPrivate: keys.spendingKeyPrivate,
        })
      );

      // Step 5: Store username
      localStorage.setItem("cypher_username", `@${cleanUsername}`);

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof Error) {
        if (err.message.includes("user rejected")) {
          setError("Transaction cancelled");
        } else if (err.message.includes("insufficient funds")) {
          setError("Insufficient balance for gas fees");
        } else if (err.message.includes("connect your wallet")) {
          setError("Please connect your wallet");
        } else {
          setError(err.message || "Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
      setIsGeneratingKeys(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
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
                disabled={isLoading}
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
                      <span className="text-muted-foreground">Checking...</span>
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
          onClick={handleSubmit}
          className="w-full"
          disabled={
            isLoading ||
            !username.trim() ||
            availability === false ||
            isChecking
          }
        >
          {isGeneratingKeys
            ? "Generating keys..."
            : isLoading
              ? "Registering..."
              : "Continue"}
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
