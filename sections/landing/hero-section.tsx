"use client";

import { useState, useCallback, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  SparkleIcon,
  StarIcon,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import AnimatedContent from "@/components/landing/animated-content";
import CustomIcon from "@/components/landing/custom-icon";
import { useUsername } from "@/hooks/useUsername";
import { ROUTES } from "@/lib/constants/routes";

const CLAIM_USERNAME_KEY = "cypher_claim_username";
const CHECK_DEBOUNCE_MS = 400;

function validateUsername(value: string): string | null {
  const trimmed = value.trim().replace(/^@+/, "");
  if (!trimmed) return "Please enter a username";
  if (trimmed.length < 3) return "Username must be at least 3 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed))
    return "Only letters, numbers, and underscores";
  return null;
}

function getCleanUsername(value: string): string {
  return value.trim().replace(/^@+/, "");
}

export default function HeroSection() {
  const router = useRouter();
  const { checkAvailability, isChecking, availability } = useUsername();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cleanUsername = getCleanUsername(username);
  const isValidFormat =
    cleanUsername.length >= 3 && /^[a-zA-Z0-9_]+$/.test(cleanUsername);
  const [lastCheckedFor, setLastCheckedFor] = useState("");

  useEffect(() => {
    if (!isValidFormat || !cleanUsername) return;
    const t = setTimeout(() => {
      setLastCheckedFor(cleanUsername);
      checkAvailability(cleanUsername);
    }, CHECK_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [cleanUsername, isValidFormat, checkAvailability]);

  const handleClaimSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const err = validateUsername(username);
      if (err) {
        setError(err);
        return;
      }
      if (availability === false) {
        setError("Username is already taken");
        return;
      }
      setError(null);
      const clean = getCleanUsername(username);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(CLAIM_USERNAME_KEY, clean);
      }
      router.push(ROUTES.LOGIN);
    },
    [username, availability, router]
  );

  const isButtonDisabled =
    !username.trim() ||
    !!validateUsername(username) ||
    availability === false ||
    isChecking;

  return (
    <section className="bg-[url('/assets/hero-gradient-bg.svg')] bg-cover bg-center bg-no-repeat md:px-16 lg:px-24 xl:px-32 px-8">
      <div className="mx-auto flex h-screen max-w-7xl flex-col items-center justify-center">
        <AnimatedContent
          reverse
          distance={30}
          className="flex items-center gap-2 rounded-full border border-white/30 bg-white/50 p-1 backdrop-blur"
        >
          <div className="flex items-center -space-x-3">
            <img
              className="size-7 rounded-full border-2 border-white"
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=50"
              alt="user 1"
            />
            <img
              className="size-7 rounded-full border-2 border-white"
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50"
              alt="user 2"
            />
          </div>
          <span>Private</span>
          <div className="mx-1 h-5 w-px rounded-full bg-white" />
          <span>Cash-level privacy on-chain</span>
          <div className="mx-1 h-5 w-px rounded-full bg-white" />
          <div className="flex items-center gap-1 pr-3">
            <StarIcon className="size-4.5 fill-brand stroke-brand" />
            <span>Secure</span>
          </div>
        </AnimatedContent>
        <AnimatedContent distance={30} delay={0.1} className="relative">
          <h1 className="mt-4 max-w-2xl text-center font-urbanist text-5xl font-bold leading-[1.15] md:text-6xl md:leading-[1.18]">
            Your crypto, truly private.
          </h1>
          <div className="absolute -top-5 right-13 hidden md:block">
            <CustomIcon icon={SparkleIcon} dir="right" />
          </div>
        </AnimatedContent>
        <AnimatedContent distance={30} delay={0.2}>
          <p className="mt-4 max-w-lg text-center text-base leading-7 text-muted-foreground">
            Everything you need to receive payments easily without exposing your
            wallet.
          </p>
        </AnimatedContent>

        <AnimatedContent
          distance={30}
          delay={0.25}
          className="mt-6 w-full max-w-md"
        >
          <form
            onSubmit={handleClaimSubmit}
            className="flex w-full flex-col gap-3"
          >
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-sm">
                cypher.app/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="your-username"
                autoComplete="username"
                className="h-12 w-full rounded-xl border border-border bg-muted pl-30 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                aria-invalid={!!error}
                aria-describedby={error ? "claim-username-error" : undefined}
              />
            </div>
            {error && (
              <p
                id="claim-username-error"
                className="flex items-center gap-1.5 text-sm text-red-600"
                role="alert"
              >
                <XCircle className="size-4 shrink-0" />
                {error}
              </p>
            )}
            {isValidFormat && !error && (
              <p
                className="flex items-center gap-1.5 text-sm"
                aria-live="polite"
              >
                {isChecking && (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Checking availability...
                    </span>
                  </>
                )}
                {!isChecking &&
                  lastCheckedFor === cleanUsername &&
                  availability === true && (
                    <>
                      <CheckCircle2 className="size-4 shrink-0 text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400">
                        Username available
                      </span>
                    </>
                  )}
                {!isChecking &&
                  lastCheckedFor === cleanUsername &&
                  availability === false && (
                    <>
                      <XCircle className="size-4 shrink-0 text-red-600" />
                      <span className="text-red-600">
                        Username already taken
                      </span>
                    </>
                  )}
              </p>
            )}
            <button
              type="submit"
              disabled={isButtonDisabled}
              className="h-12 w-full rounded-xl bg-brand font-semibold text-brand-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Claim My Username
            </button>
          </form>
        </AnimatedContent>

        <AnimatedContent className="mt-6 flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <Link
            href="#features"
            className="relative w-full rounded-full border border-white bg-white/50 px-8 py-3 text-center font-medium text-muted-foreground md:w-auto md:py-2.5"
          >
            See how it works
            <AnimatedContent
              direction="horizontal"
              className="absolute right-0 top-full size-8 -translate-y-1/2 pointer-events-none"
            >
              <Image
                src="/assets/mouse-arrow.svg"
                alt="arrow"
                width={24}
                height={24}
              />
            </AnimatedContent>
          </Link>
        </AnimatedContent>
      </div>
    </section>
  );
}
