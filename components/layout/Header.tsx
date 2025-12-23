"use client";

import Link from "next/link";
import { Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface HeaderProps {
  username: string;
  hasNotifications?: boolean;
}

export function Header({ username, hasNotifications = false }: HeaderProps) {
  const router = useRouter();

  const handleSettings = () => {
    router.push("/settings");
  };

  const handleNotifications = () => {
    router.push("/notifications");
  };

  return (
    <div className="flex items-center gap-2 justify-between w-full">
      <p className="text-sm text-foreground">{username}</p>
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={handleNotifications}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {hasNotifications && (
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSettings}
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </div>
    </div>
  );
}
