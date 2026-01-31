"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft, Check, X, Loader2 } from "lucide-react";

import { PINInput } from "@/components/auth/PINInput";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useOnboarding } from "./useOnboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const {
    username,
    step,
    error,
    isLoading,
    isCheckingRegistration,
    isChecking,
    availability,
    isWalletLoading,
    isConnected,
    hasWalletAddress,
    validateUsername,
    handleInputChange,
    handleUsernameSubmit,
    handlePINComplete,
    handleBack,
    setError,
  } = useOnboarding();

  if (isCheckingRegistration) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-base text-muted-foreground">
          Checking registration...
        </p>
      </div>
    );
  }

  if (step === "username") {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="px-6 pt-6 md:px-8 md:pt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8 md:py-12 items-center justify-center">
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex flex-col items-center gap-3">
              <Logo width={80} height={80} />
              <h1 className="font-urbanist text-2xl font-bold text-foreground md:text-3xl text-center">
                Your private identity, your way
              </h1>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Create a unique username to receive crypto privately. Your
                identity stays hidden while you stay connected.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6 w-full">
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

            <div className="flex flex-col gap-3 w-full">
              <Button
                type="button"
                size="lg"
                onClick={handleUsernameSubmit}
                className="w-full"
                disabled={
                  isLoading ||
                  isWalletLoading ||
                  !username.trim() ||
                  availability === false ||
                  isChecking ||
                  !isConnected ||
                  !hasWalletAddress
                }
              >
                Continue
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "pin") {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="px-6 pt-6 md:px-8 md:pt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8 md:py-12 items-center justify-center">
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex flex-col items-center gap-3">
              <Logo width={80} height={80} />
              <h1 className="font-urbanist text-2xl font-bold text-foreground md:text-3xl text-center">
                Set Your PIN
              </h1>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Create a 6-digit PIN to secure your private keys. You&apos;ll
                need this PIN to recover your keys.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6 w-full">
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

            <div className="flex flex-col gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBack}
                disabled={isLoading}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "signing" || step === "registering") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-8 text-center">
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
