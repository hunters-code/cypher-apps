"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecentActivityItem } from "./RecentActivityItem";

export interface RecentActivity {
  id: string;
  type: "SEND" | "RECEIVE";
  username: string;
  amount: string;
  token: string;
  timestamp: string;
  isPrivate?: boolean;
}

interface RecentActivityListProps {
  activities: RecentActivity[];
  onActivityClick?: (activity: RecentActivity) => void;
  showViewAll?: boolean;
}

export function RecentActivityList({
  activities,
  onActivityClick,
  showViewAll = true,
}: RecentActivityListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Recent Activity</h2>
        {showViewAll && (
          <Link href="/history">
            <Button variant="ghost" size="sm">
              View All →
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-1.5">
        {activities.map((activity) => (
          <RecentActivityItem
            key={activity.id}
            type={activity.type}
            username={activity.username}
            amount={activity.amount}
            token={activity.token}
            timestamp={activity.timestamp}
            isPrivate={activity.isPrivate}
            onClick={() => onActivityClick?.(activity)}
          />
        ))}
      </div>
    </div>
  );
}

