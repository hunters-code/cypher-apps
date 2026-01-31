"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useLogin } from "./useLogin";

export default function LoginPage() {
  const router = useRouter();
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
              Your private crypto wallet awaits
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Send and receive crypto privately with Stealth Address technology
              on Base L2.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full">
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
                  error
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
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

          <div className="flex flex-col gap-3 w-full">
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
      </div>
    </div>
  );
}
