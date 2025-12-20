import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Cypher</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm">@nashirjamali</p>
          <Link href="/settings">
            <Button variant="ghost" size="sm">⚙️</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Total Balance</p>
        <p className="text-3xl font-bold">$2,456.78 USD</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/send" className="block">
          <Button variant="outline" className="h-20 w-full rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <span>↑</span>
              <span>Send</span>
            </div>
          </Button>
        </Link>
        <Link href="/receive" className="block">
          <Button variant="outline" className="h-20 w-full rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <span>↓</span>
              <span>Receive</span>
            </div>
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Assets</h2>
          <Button variant="ghost" size="sm">+ Add</Button>
        </div>

        <div className="space-y-2">
          <div className="border rounded-lg p-4 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">[ETH]</span>
                <span>Ethereum</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>1.2458 ETH</span>
              <span className="text-muted-foreground">$2,234.56</span>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">[USDC]</span>
                <span>USD Coin</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>222.22 USDC</span>
              <span className="text-muted-foreground">$222.22</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent Activity</h2>
          <Link href="/history">
            <Button variant="ghost" size="sm">View All →</Button>
          </Link>
        </div>

        <div className="space-y-2">
          <div className="border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2">
              <span>↑</span>
              <span className="font-medium">Sent to @alice</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">-0.5 ETH</span>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <span className="text-xs">🔒 Private</span>
          </div>

          <div className="border rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2">
              <span>↓</span>
              <span className="font-medium">Received from @bob</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+100 USDC</span>
              <span className="text-xs text-muted-foreground">5 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

