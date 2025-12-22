"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Send, Download, QrCode, History } from "lucide-react";

export function ActionsButton() {
  return (
    <div className="flex flex-row gap-4">
      <Link href="/send" className="flex-1">
        <Button variant="outline" className="h-16 w-full rounded-lg">
          <Send className="h-5 w-5" />
        </Button>
      </Link>
      <Link href="/receive" className="flex-1">
        <Button variant="outline" className="h-16 w-full rounded-lg">
          <Download className="h-5 w-5" />
        </Button>
      </Link>
      <Link href="/scan" className="flex-1">
        <Button variant="outline" className="h-16 w-full rounded-lg">
          <QrCode className="h-5 w-5" />
        </Button>
      </Link>
      <Link href="/history" className="flex-1">
        <Button variant="outline" className="h-16 w-full rounded-lg">
          <History className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}
