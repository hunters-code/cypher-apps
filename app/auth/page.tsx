"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  usePrivy,
  useLoginWithEmail,
  useLoginWithSms,
} from "@privy-io/react-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { hasSession } from "@/lib/utils/session";

export default function AuthPage() {
  const router = useRouter();
  const { ready } = usePrivy();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { setContactValue, setLoginMethod } = useAuth();
  const { sendCode: sendEmailCode } = useLoginWithEmail();
  const { sendCode: sendSmsCode } = useLoginWithSms();

  useEffect(() => {
    if (ready && hasSession()) {
      router.push("/dashboard");
    }
  }, [ready, router]);

  const validateInput = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-()]+$/;

    if (!value.trim()) {
      setError("Please enter your email or phone number");
      return false;
    }

    if (emailRegex.test(value) || phoneRegex.test(value.replace(/\s/g, ""))) {
      setError("");
      return true;
    }

    setError("Please enter a valid email or phone number");
    return false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailOrPhone(value);
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateInput(emailOrPhone)) {
      return;
    }

    setIsLoading(true);
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-()]+$/;

    setContactValue(emailOrPhone);

    try {
      // await new Promise((resolve) => setTimeout(resolve, 500));

      if (emailRegex.test(emailOrPhone)) {
        setLoginMethod("email");
        await sendEmailCode({ email: emailOrPhone });
      } else if (phoneRegex.test(emailOrPhone)) {
        setLoginMethod("sms");
        await sendSmsCode({ phoneNumber: emailOrPhone });
      }

      // router.push("/onboarding");
      router.push("/otp");
    } catch (error) {
      console.log(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (ready && hasSession()) {
    return null;
  }

  return (
    <div className="flex flex-col justify-between items-center gap-4 text-center h-full w-full py-32 px-8">
      <div className="flex flex-col items-center gap-8 text-center w-full">
        <h1 className="text-3xl font-bold text-foreground text-left">
          Your private crypto wallet awaits
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email or Phone Number
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="cypher@example.com"
              value={emailOrPhone}
              onChange={handleInputChange}
              onBlur={() => validateInput(emailOrPhone)}
              className={
                error ? "border-destructive focus-visible:ring-destructive" : ""
              }
              aria-invalid={!!error}
              aria-describedby={error ? "email-error" : undefined}
              disabled={isLoading}
              autoComplete="email"
            />
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
          type="button"
          onClick={handleSubmit}
          className="w-full"
          disabled={isLoading || !emailOrPhone.trim()}
        >
          {isLoading ? "Continuing..." : "Continue"}
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms & Privacy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
