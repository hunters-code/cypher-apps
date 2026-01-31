"use client";

import * as React from "react";
import { useState } from "react";

import { REGEXP_ONLY_DIGITS, OTPInputContext } from "input-otp";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { validatePIN, type PINValidationResult } from "@/lib/utils/pin";

function PINInputSlot({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-12 w-12 items-center justify-center border-y border-x rounded-md text-sm shadow-xs transition-all outline-none data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className
      )}
    >
      {char ? "•" : null}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

interface PINInputProps {
  onComplete: (pin: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function PINInput({
  onComplete,
  onError,
  disabled = false,
  label,
  description,
}: PINInputProps) {
  const [pin, setPin] = useState("");
  const [validation, setValidation] = useState<PINValidationResult | null>(
    null
  );

  const handleChange = (value: string) => {
    if (value.length <= 6) {
      setPin(value);

      if (value.length === 6) {
        const result = validatePIN(value);
        setValidation(result);

        if (result.valid) {
          onComplete(value);
        } else if (onError) {
          onError(result.error || "Invalid PIN");
        }
      } else {
        setValidation(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pin">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={pin}
          onChange={handleChange}
          disabled={disabled}
          pattern={REGEXP_ONLY_DIGITS}
        >
          <InputOTPGroup className="w-full justify-between gap-2">
            <PINInputSlot index={0} />
            <PINInputSlot index={1} />
            <PINInputSlot index={2} />
            <PINInputSlot index={3} />
            <PINInputSlot index={4} />
            <PINInputSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {validation && !validation.valid && (
        <Alert variant="destructive">
          <AlertDescription>{validation.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
