"use client";

import { ReactNode } from "react";

import { BottomNav } from "./bottom-nav";
import { DashboardSidebar } from "./dashboard-sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        <main className="flex-1">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
