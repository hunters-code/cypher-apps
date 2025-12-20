import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HistoryPage() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">←</Button>
        </Link>
        <h1 className="text-xl font-bold">Transaction History</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">🔍</Button>
          <Button variant="ghost" size="icon">⋯</Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">All Types ▼</Button>
          <Button variant="outline" size="sm" className="flex-1">All Tokens ▼</Button>
        </div>

        <Input placeholder="Search transactions..." />
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold">Today</h2>
        <div className="space-y-2">
          <div className="border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2">
              <span>↑</span>
              <span className="font-medium">Sent</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">to @alice</span>
              <span className="font-medium">-1.5 ETH</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">🔒 Private</span>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2">
              <span>↓</span>
              <span className="font-medium">Received</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">from @bob</span>
              <span className="font-medium">+0.5 ETH</span>
            </div>
            <span className="text-xs text-muted-foreground">5 hours ago</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold">Yesterday</h2>
        <div className="border rounded-lg p-4 space-y-1">
          <div className="flex items-center gap-2">
            <span>↓</span>
            <span className="font-medium">Received</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">from @charlie</span>
            <span className="font-medium">+100 USDC</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">🔒 Private</span>
            <span className="text-xs text-muted-foreground">1 day ago</span>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full">Load More</Button>
    </div>
  );
}

