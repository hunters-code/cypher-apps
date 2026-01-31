"use client";

import { PINInput } from "@/components/auth/PINInput";
import { Button } from "@/components/ui/button";

import { useRecover } from "./useRecover";

export default function RecoverPage() {
  const {
    error,
    isLoading,
    shouldRender,
    handlePINComplete,
    handleBack,
    setError,
  } = useRecover();

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col justify-between gap-6 px-4 py-8 md:py-12">
      <div className="flex flex-col items-center gap-8 text-center w-full">
        <h1 className="text-3xl font-bold text-foreground text-left">
          Enter Your PIN
        </h1>
        <p className="text-base text-muted-foreground text-left">
          Enter your 6-digit PIN to recover your wallet keys.
        </p>

        <div className="w-full">
          <PINInput
            onComplete={handlePINComplete}
            onError={setError}
            disabled={isLoading}
            label="Enter your 6-digit PIN"
            description="This PIN is required to recover your private keys"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive text-left w-full" role="alert">
            {error}
          </p>
        )}
      </div>

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
  );
}
