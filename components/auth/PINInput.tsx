"use client";

import { useState } from "react";

import { REGEXP_ONLY_DIGITS } from "input-otp";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { validatePIN, type PINValidationResult } from "@/lib/utils/pin";

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
  label = "Enter your 6-digit PIN",
  description = "This PIN will be used to secure your private keys",
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
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
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
