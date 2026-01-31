"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Home, Link2, Send, History, Settings } from "lucide-react";

import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

const navItems = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: Home },
  { href: ROUTES.RECEIVE, label: "Receive", icon: Link2 },
  { href: ROUTES.SEND, label: "Send", icon: Send },
  { href: ROUTES.HISTORY, label: "Activities", icon: History },
  { href: ROUTES.SETTINGS, label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-background/95 py-2 backdrop-blur md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={item.label}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
