"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemSeparator,
} from "@/components/ui/item";
import {
  Bell,
  CheckCircle2,
  ArrowRight,
  X,
  Send,
  Receipt,
  Shield,
  AlertCircle,
} from "lucide-react";

interface Notification {
  id: string;
  type: "TRANSACTION" | "SECURITY" | "SYSTEM";
  title: string;
  message: string;
  timestamp: string;
  dateGroup: string;
  isRead: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "TRANSACTION",
    title: "Transaction Received",
    message: "You received 1.5 ETH from @alice",
    timestamp: "2 minutes ago",
    dateGroup: "Today",
    isRead: false,
    actionUrl: "/transaction/1",
  },
  {
    id: "2",
    type: "TRANSACTION",
    title: "Transaction Sent",
    message: "You sent 0.5 ETH to @bob",
    timestamp: "1 hour ago",
    dateGroup: "Today",
    isRead: false,
    actionUrl: "/transaction/2",
  },
  {
    id: "3",
    type: "SECURITY",
    title: "New Device Detected",
    message: "A new device signed in to your account",
    timestamp: "3 hours ago",
    dateGroup: "Today",
    isRead: true,
  },
  {
    id: "4",
    type: "TRANSACTION",
    title: "Transaction Confirmed",
    message: "Your transaction to @charlie has been confirmed",
    timestamp: "Yesterday",
    dateGroup: "Yesterday",
    isRead: true,
    actionUrl: "/transaction/4",
  },
  {
    id: "5",
    type: "SYSTEM",
    title: "Wallet Backup Reminder",
    message: "Don't forget to backup your wallet keys",
    timestamp: "2 days ago",
    dateGroup: "2 days ago",
    isRead: true,
  },
  {
    id: "6",
    type: "TRANSACTION",
    title: "Stealth Address Generated",
    message: "A new stealth address was generated for @david",
    timestamp: "3 days ago",
    dateGroup: "3 days ago",
    isRead: true,
    actionUrl: "/transaction/6",
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "TRANSACTION":
      return Receipt;
    case "SECURITY":
      return Shield;
    case "SYSTEM":
      return AlertCircle;
    default:
      return Bell;
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    notifications.forEach((notification) => {
      if (!groups[notification.dateGroup]) {
        groups[notification.dateGroup] = [];
      }
      groups[notification.dateGroup].push(notification);
    });
    return groups;
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIconComponent = (type: Notification["type"]) => {
    const Icon = getNotificationIcon(type);
    return <Icon className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 w-full px-4 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-sm"
              >
                Mark all as read
              </Button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications</p>
              <p className="text-sm text-muted-foreground mt-2">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedNotifications).map(
                ([dateGroup, groupNotifications]) => (
                  <div key={dateGroup} className="space-y-2">
                    <h2 className="font-semibold text-foreground text-sm">
                      {dateGroup}
                    </h2>
                    <div className="space-y-1">
                      {groupNotifications.map((notification, index) => {
                        const IconComponent = getNotificationIcon(
                          notification.type
                        );
                        return (
                          <div key={notification.id}>
                            <Item
                              variant="default"
                              className={`cursor-pointer hover:bg-muted/50 w-full ${
                                !notification.isRead
                                  ? "bg-primary/5 border-l-2 border-l-primary"
                                  : ""
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <ItemMedia variant="icon">
                                <IconComponent className="h-4 w-4 text-primary" />
                              </ItemMedia>
                              <ItemContent>
                                <div className="flex items-center gap-2">
                                  <ItemTitle className="text-left">
                                    {notification.title}
                                  </ItemTitle>
                                  {!notification.isRead && (
                                    <div className="h-2 w-2 bg-primary rounded-full" />
                                  )}
                                </div>
                                <ItemDescription className="text-left">
                                  {notification.message}
                                </ItemDescription>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {notification.timestamp}
                                </p>
                              </ItemContent>
                              <ItemActions>
                                <div className="flex items-center gap-1">
                                  {!notification.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsRead(notification.id);
                                      }}
                                    >
                                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => handleDelete(notification.id, e)}
                                  >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                  {notification.actionUrl && (
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </ItemActions>
                            </Item>
                            {index < groupNotifications.length - 1 && (
                              <ItemSeparator />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full px-4 py-4 bg-background border-t border-border shrink-0">
        <Button variant="secondary" className="w-full" onClick={handleBack}>
          Back
        </Button>
      </div>
    </div>
  );
}

