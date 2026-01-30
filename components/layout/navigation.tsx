"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

interface NavigationProps {
  username?: string;
  showSettings?: boolean;
}

export function Navigation({ username, showSettings = true }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: ROUTES.DASHBOARD, label: "Dashboard" },
    { href: ROUTES.SEND, label: "Send" },
    { href: ROUTES.RECEIVE, label: "Receive" },
    { href: ROUTES.HISTORY, label: "Transaction History" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="flex items-center justify-between w-full py-4 px-4 border-b border-border">
      <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
        <Logo />
        <span className="text-xl font-bold text-foreground">Cypher</span>
      </Link>

      <div className="flex items-center gap-2">
        {username && (
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            {username}
          </span>
        )}
        {showSettings && (
          <Link href={ROUTES.SETTINGS}>
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              ⚙️
            </Button>
          </Link>
        )}

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="sm:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Logo />
                <span className="text-xl font-bold">Cypher</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {showSettings && (
                <Link
                  href={ROUTES.SETTINGS}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive(ROUTES.SETTINGS)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  Settings
                </Link>
              )}
            </nav>
            {username && (
              <div className="mt-auto pt-8 border-t border-border">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-foreground">
                    {username}
                  </p>
                  <p className="text-xs text-muted-foreground">Wallet</p>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
