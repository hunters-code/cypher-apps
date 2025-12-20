import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">←</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm">×</Button>
        </Link>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Welcome to Cypher</h1>
        <p className="text-sm text-muted-foreground">Login with Email or Phone Number</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email or Phone Number</Label>
          <Input
            id="email"
            type="text"
            placeholder="nashir@example.com"
          />
        </div>

        <Link href="/onboarding" className="block">
          <Button className="w-full rounded-full">Continue</Button>
        </Link>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        By continuing, you agree to our Terms & Privacy
      </p>
      <p className="text-xs text-center text-muted-foreground">Powered by Privy</p>
    </div>
  );
}

