"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (value: string): boolean => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setError("Please enter a username");
      return false;
    }

    const usernameWithoutAt = trimmedValue.replace(/^@+/, "");
    
    if (usernameWithoutAt.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameWithoutAt)) {
      setError("Username can only contain letters, numbers, and underscores");
      return false;
    }

    setError("");
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/^@+/, "");
    setUsername(value);
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateUsername(username)) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const usernameWithPrefix = `@${username.trim()}`;
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between items-center gap-4 text-center h-full w-full py-32 px-8">
      <div className="flex flex-col items-center gap-8 text-center w-full">
        <h1 className="text-3xl font-bold text-foreground text-left">
          Your private identity, your way
        </h1>
        <p className="text-base text-muted-foreground text-left">
          Create a unique username to receive crypto privately. Your identity stays hidden while you stay connected.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">
              Username
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                @
              </span>
              <Input
                id="username"
                type="text"
                placeholder="yourusername"
                value={username}
                onChange={handleInputChange}
                onBlur={() => validateUsername(username)}
                className={`pl-8 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                aria-invalid={!!error}
                aria-describedby={error ? "username-error" : undefined}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            {error && (
              <p
                id="username-error"
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
          disabled={isLoading || !username.trim()}
        >
          {isLoading ? "Creating..." : "Continue"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
