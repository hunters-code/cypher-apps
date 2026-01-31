"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  Send,
  Download,
  History,
  Settings,
  FileText,
  Twitter,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

const navItems = [
  { href: ROUTES.DASHBOARD, label: "Dashboard", icon: Home },
  { href: ROUTES.SEND, label: "Send", icon: Send },
  { href: ROUTES.RECEIVE, label: "Receive", icon: Download },
  { href: ROUTES.HISTORY, label: "Activities", icon: History },
  { href: ROUTES.SETTINGS, label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 flex-col border-r border-border bg-muted/30 md:flex">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="font-urbanist text-lg font-semibold text-foreground">
            Cypher
          </span>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            BETA
          </span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-border p-4">
        <div className="flex flex-col gap-1">
          <a
            href="https://docs.cypher.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <FileText className="h-4 w-4" />
            Docs
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Twitter className="h-4 w-4" />X (Twitter)
          </a>
        </div>
      </div>
    </aside>
  );
}
