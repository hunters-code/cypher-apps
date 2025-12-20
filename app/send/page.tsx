import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SendPage() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">←</Button>
        </Link>
        <h1 className="text-xl font-bold">Send</h1>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">×</Button>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">To</Label>
          <div className="flex gap-2">
            <Input
              id="recipient"
              type="text"
              placeholder="@username"
              className="flex-1"
            />
            <Button variant="outline" size="icon">📷</Button>
          </div>
          <p className="text-xs text-muted-foreground">Send to username or paste address</p>
          <p className="text-xs">✓ @alice found</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              placeholder="1.5"
              className="flex-1"
            />
            <Button variant="outline">ETH ▼</Button>
          </div>
          <p className="text-xs text-muted-foreground">≈ $2,685.00 USD</p>
          <p className="text-xs text-muted-foreground">Balance: 1.2458 ETH</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm">25%</Button>
          <Button variant="outline" size="sm">50%</Button>
          <Button variant="outline" size="sm">Max</Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="privacy">🔒 Privacy Mode</Label>
            <Button variant="outline" size="sm">Toggle ON</Button>
          </div>
          <p className="text-xs text-muted-foreground">Transfer will use stealth address</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Estimated Fee: ~0.0002 ETH ($0.36)</p>
        </div>

        <Button className="w-full rounded-full">Continue</Button>
      </div>
    </div>
  );
}

