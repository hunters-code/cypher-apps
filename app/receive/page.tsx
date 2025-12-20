import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReceivePage() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">←</Button>
        </Link>
        <h1 className="text-xl font-bold">Receive</h1>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">×</Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold">Receive Crypto</h2>
        </div>

        <div className="flex justify-center">
          <div className="border-2 border-dashed rounded-lg p-8 w-64 h-64 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-4xl">[QR Code]</div>
              <p className="text-sm">@nashirjamali</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Your Cypher ID</Label>
          <div className="flex gap-2">
            <Input value="@nashirjamali" readOnly />
            <Button variant="outline">Copy</Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Your Wallet Address</Label>
          <div className="flex gap-2">
            <Input value="0x9a3d6c5f8e2b1a7c4d9e..." readOnly className="text-xs" />
            <Button variant="outline">Copy</Button>
          </div>
        </div>

        <Button className="w-full rounded-full">Share QR Code</Button>

        <p className="text-xs text-center text-muted-foreground">
          ℹ️ Funds sent to your username will be private
        </p>
      </div>
    </div>
  );
}

