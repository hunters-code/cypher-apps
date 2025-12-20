import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <Logo />
      <h1 className="text-4xl font-bold">CYPHER</h1>
      <p className="text-lg text-muted-foreground">Your Private Crypto Wallet</p>
      
      <Link href="/auth" className="w-full">
        <Button size="lg" className="w-full rounded-full">Login / Sign Up</Button>
      </Link>
      
      <div className="w-full space-y-3 text-left mt-8">
        <p className="text-sm">🔒 Private transfers with Stealth Addresses</p>
        <p className="text-sm">👤 Send using @username</p>
        <p className="text-sm">🔐 Non-custodial - You own your keys</p>
      </div>
    </div>
  );
}
