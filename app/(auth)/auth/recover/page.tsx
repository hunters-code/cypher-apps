"use client";

import { ArrowLeft } from "lucide-react";

import { PINInput } from "@/components/auth/PINInput";
import { Logo } from "@/components/shared/logo";

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
    <div className="flex min-h-screen flex-col">
      <div className="px-6 pt-6 md:px-8 md:pt-8">
        <button
          type="button"
          onClick={handleBack}
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
              Enter Your PIN
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Enter your 6-digit PIN to recover your wallet keys.
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
        </div>
      </div>
    </div>
  );
}
