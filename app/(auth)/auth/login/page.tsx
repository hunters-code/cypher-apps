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
    <div className="mx-auto flex w-full max-w-4xl flex-col justify-between gap-6 px-4 py-8 md:py-12">
      <div className="flex flex-col gap-6 w-full">
        <div>
          <h1 className="font-urbanist text-2xl font-bold text-foreground md:text-3xl">
            Your private crypto wallet awaits
          </h1>
        </div>
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

      <div className="flex flex-col gap-3 w-full shrink-0">
        <Button
          type="button"
          size="lg"
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
