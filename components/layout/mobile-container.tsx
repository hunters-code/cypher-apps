"use client";

import { ReactNode } from "react";

import { usePathname } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";

import { ROUTES } from "@/lib/constants/routes";
import { hasSession } from "@/lib/utils/session";

import { AppShell } from "./app-shell";

interface MobileContainerProps {
  children: ReactNode;
}

const authRoutes = [
  ROUTES.LOGIN,
  ROUTES.VERIFY,
  ROUTES.ONBOARDING,
  ROUTES.RECOVER,
];

export function MobileContainer({ children }: MobileContainerProps) {
  const pathname = usePathname();
  const { authenticated, ready } = usePrivy();

  if (!ready) {
    return null;
  }

  const isAuthRoute = authRoutes.includes(pathname as typeof ROUTES.LOGIN);
  const hasValidSession = hasSession();

  if (isAuthRoute || !authenticated || !hasValidSession) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
