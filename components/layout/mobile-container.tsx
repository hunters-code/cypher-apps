import { ReactNode } from "react";

import { AppShell } from "./app-shell";

interface MobileContainerProps {
  children: ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  return <AppShell>{children}</AppShell>;
}
