"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useLoginWithEmail } from "@privy-io/react-auth";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/useAuth";

export default function OTPPage() {
  const router = useRouter();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const { loginMethod, contactValue } = useAuth();
  const {
    loginWithCode,
    sendCode: sendEmailCode,
    state,
  } = useLoginWithEmail({
    onComplete: (params) => {
      console.log("params", params);

      /**
       * TODO: check if user already has a username as well
       * if yes, redirect to dashboard
       * if no, redirect to onboarding
       */
      const hasUsername = true;

      if (params.isNewUser || !hasUsername) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (err) => {
      setError(err || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    loginWithCode({ code: otp });
  };

  const handleResendOTP = async () => {
    if (loginMethod === "email" && contactValue) {
      await sendEmailCode({ email: contactValue });
      // TODO: maybe add toaster to notify user that code has been sent?
    } else if (loginMethod === "sms" && contactValue) {
      // TODO: handle SMS resend here...
    }
  };

  useEffect(() => {
    if (!contactValue) {
      router.push("/auth");
    }
  }, [contactValue, router]);

  return (
    <div className="flex flex-col justify-between items-center gap-4 text-center h-full w-full py-32 px-8">
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

      <div className="flex flex-col gap-4 w-full">
        <Button
          type="submit"
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
