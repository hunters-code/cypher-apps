import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/auth">
          <Button variant="ghost" size="sm">←</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">×</Button>
        </Link>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Choose Your Cypher ID</h1>
        <p className="text-sm text-muted-foreground">This is how people will send you crypto</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Your Cypher ID</Label>
          <Input
            id="username"
            type="text"
            placeholder="@username"
          />
          <p className="text-xs text-muted-foreground">✓ Available</p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-medium">Requirements:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Must start with @</li>
            <li>• 3-20 characters</li>
            <li>• Letters, numbers, underscore only</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">Examples: @alice, @bob123, @crypto_user</p>
        </div>

        <Link href="/dashboard" className="block">
          <Button className="w-full rounded-full">Continue</Button>
        </Link>
      </div>
    </div>
  );
}

