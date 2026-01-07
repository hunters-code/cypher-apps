"use client";

import React, { createContext, useState, useMemo, ReactNode } from "react";

type LoginMethod = "email" | "sms";

interface AuthContextType {
  loginMethod: LoginMethod;
  setLoginMethod: (method: LoginMethod) => void;
  contactValue: string;
  setContactValue: (value: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [contactValue, setContactValue] = useState<string>("");

  const value = useMemo(
    () => ({
      loginMethod,
      setLoginMethod,
      contactValue,
      setContactValue,
    }),
    [loginMethod, contactValue]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
