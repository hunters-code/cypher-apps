"use client";

import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useVerify } from "./useVerify";

export default function VerifyPage() {
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

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col justify-between gap-6 px-4 py-8 md:py-12">
      <div className="flex flex-col items-center gap-4 w-full">
        <h1 className="text-3xl font-bold text-foreground text-left">
          Enter confirmation code
        </h1>

        <p className="text-base text-muted-foreground text-left">
          Please check <b>{contactValue}</b> for an{" "}
          {loginMethod === "email" ? "email" : "sms"} from privy.io and enter
          your code below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="space-y-2">
            <InputOTP
              value={otp}
              onChange={(value) => setOtp(value)}
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
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
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Button
          type="submit"
          size="lg"
          onClick={handleSubmit}
          className="w-full"
          disabled={state.status === "submitting-code" || otp.trim().length < 6}
        >
          {state.status === "submitting-code" ? "Continuing..." : "Continue"}
        </Button>
        <span>
          Didn&apos;t get the code?{" "}
          <Button onClick={handleResendOTP} className="px-0" variant="link">
            Resend OTP
          </Button>
        </span>
      </div>
    </div>
  );
}
