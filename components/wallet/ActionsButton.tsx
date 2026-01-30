"use client";

import Link from "next/link";

import { Send, Download, QrCode, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

export function ActionsButton() {
  return (
    <div className="flex flex-row gap-4">
      <Link href={ROUTES.SEND} className="flex-1">
        <Button variant="outline" className="h-16 w-full rounded-lg">
          <Send className="h-5 w-5" />
        </Button>
      </Link>
      <Link href={ROUTES.RECEIVE} className="flex-1">
        <Button variant="outline" className="h-16 w-full rounded-lg">
          <Download className="h-5 w-5" />
        </Button>
      </Link>
      <Link href={ROUTES.SCAN} className="flex-1">
        <Button variant="outline" className="h-16 w-full rounded-lg">
          <QrCode className="h-5 w-5" />
        </Button>
      </Link>
      <Link href={ROUTES.HISTORY} className="flex-1">
        <Button variant="outline" className="h-16 w-full rounded-lg">
          <History className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}
