import { useState, useEffect, useCallback } from "react";

import { useRouter } from "next/navigation";

import {
  usePrivy,
  useLoginWithEmail,
  useLoginWithSms,
} from "@privy-io/react-auth";

import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants/routes";
import { hasSession } from "@/lib/utils/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s-()]+$/;

export function useLogin() {
  const router = useRouter();
  const { ready } = usePrivy();
  const { setContactValue, setLoginMethod } = useAuth();
  const { sendCode: sendEmailCode } = useLoginWithEmail();
  const { sendCode: sendSmsCode } = useLoginWithSms();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  const validateInput = useCallback((value: string): boolean => {
    if (!value.trim()) {
      setError("Please enter your email or phone number");
      return false;
    }

    const cleanPhone = value.replace(/\s/g, "");
    const isValidEmail = EMAIL_REGEX.test(value);
    const isValidPhone = PHONE_REGEX.test(cleanPhone);

    if (isValidEmail || isValidPhone) {
      setError("");
      return true;
    }

    setError("Please enter a valid email or phone number");
    return false;
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmailOrPhone(value);
      if (error) {
        setError("");
      }
    },
    [error]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent | React.MouseEvent) => {
      if (e) {
        e.preventDefault();
      }

      if (!validateInput(emailOrPhone)) {
        return;
      }

      setIsLoading(true);
      setError("");
      setContactValue(emailOrPhone);

      try {
        const isEmail = EMAIL_REGEX.test(emailOrPhone);
        const isPhone = PHONE_REGEX.test(emailOrPhone.replace(/\s/g, ""));

        if (isEmail) {
          setLoginMethod("email");
          await sendEmailCode({ email: emailOrPhone });
        } else if (isPhone) {
          setLoginMethod("sms");
          await sendSmsCode({ phoneNumber: emailOrPhone });
        }

        router.push(ROUTES.VERIFY);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [
      emailOrPhone,
      validateInput,
      setContactValue,
      setLoginMethod,
      sendEmailCode,
      sendSmsCode,
      router,
    ]
  );

  useEffect(() => {
    if (ready && hasSession()) {
      setShouldRender(false);
      router.push(ROUTES.DASHBOARD);
    } else {
      setShouldRender(true);
    }
  }, [ready, router]);

  return {
    emailOrPhone,
    setEmailOrPhone,
    error,
    isLoading,
    shouldRender,
    handleInputChange,
    handleSubmit,
    validateInput,
  };
}
