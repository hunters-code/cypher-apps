"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, QrCode, History } from "lucide-react";

export function ActionsButton() {
  return (
    <div className="flex flex-row gap-4">
      <Button variant="outline" className="h-16 flex-1 rounded-lg">
        <ArrowUp className="h-5 w-5" />
      </Button>
      <Button variant="outline" className="h-16 flex-1 rounded-lg">
        <ArrowDown className="h-5 w-5" />
      </Button>
      <Button variant="outline" className="h-16 flex-1 rounded-lg">
        <QrCode className="h-5 w-5" />
      </Button>
      <Button variant="outline" className="h-16 flex-1 rounded-lg">
        <History className="h-5 w-5" />
      </Button>
    </div>
  );
}
