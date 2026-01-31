"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useVerify } from "./useVerify";

export default function VerifyPage() {
  const router = useRouter();
  const otpInputRef = useRef<HTMLInputElement>(null);
  const {
    otp,
    setOtp,
    error,
    loginMethod,
    contactValue,
    state,
    handleSubmit,
    handleResendOTP,
  } = useVerify();

  useEffect(() => {
    const timer = setTimeout(() => {
      const firstInput = document.querySelector(
        '[data-slot-index="0"]'
      ) as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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
              Enter confirmation code
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Please check <b>{contactValue}</b> for an{" "}
              {loginMethod === "email" ? "email" : "sms"} from privy.io and
              enter your code below.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full">
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            <div className="space-y-2">
              <InputOTP
                ref={otpInputRef}
                value={otp}
                onChange={(value) => setOtp(value)}
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                autoFocus
              >
                <InputOTPGroup className="w-full justify-between">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <p
                  id="email-error"
                  className="text-sm text-destructive text-left"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          </form>

          <div className="flex flex-col gap-3 w-full">
            <Button
              type="submit"
              size="lg"
              onClick={handleSubmit}
              className="w-full"
              disabled={
                state.status === "submitting-code" || otp.trim().length < 6
              }
            >
              {state.status === "submitting-code"
                ? "Continuing..."
                : "Continue"}
            </Button>
            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Didn&apos;t get the code?{" "}
                <Button
                  onClick={handleResendOTP}
                  className="px-0 h-auto"
                  variant="link"
                >
                  Resend OTP
                </Button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
