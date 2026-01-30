"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useLogin } from "./useLogin";

export default function LoginPage() {
  const {
    emailOrPhone,
    error,
    isLoading,
    shouldRender,
    handleInputChange,
    handleSubmit,
    validateInput,
  } = useLogin();

  if (!shouldRender) {
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
