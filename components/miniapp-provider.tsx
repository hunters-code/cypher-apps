"use client";

import { useEffect } from "react";

import { sdk } from "@farcaster/miniapp-sdk";

export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return <>{children}</>;
}
