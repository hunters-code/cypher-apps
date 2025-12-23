"use client";

import { useRouter } from "next/navigation";

import { CryptoWallet } from "@/components/icons/crypto-wallet";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth");
  };

  return (
    <div className="flex flex-col justify-between items-center gap-4 text-center h-full w-full py-32 px-8">
      <CryptoWallet width={200} height={200} />
      <div className="flex flex-col items-center gap-12 text-center">
        <h1 className="text-4xl font-bold">Your crypto, truly private</h1>
        <p className="text-muted-foreground">
          Enjoy cash-level privacy on the blockchain. Send to usernames without
          exposing your transaction history or balance.
        </p>
        <Button size="lg" className="w-full" onClick={handleGetStarted}>
          Get Started
        </Button>
      </div>
    </div>
  );
}
