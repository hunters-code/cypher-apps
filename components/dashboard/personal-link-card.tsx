"use client";

import { useState } from "react";

import Link from "next/link";

import {
  MoreVertical,
  Copy,
  QrCode,
  ExternalLink,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

interface PersonalLinkCardProps {
  username: string;
  baseUrl?: string;
}

export function PersonalLinkCard({
  username,
  baseUrl = "cypher.me",
}: PersonalLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const link = `${baseUrl}/${username || "username"}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-urbanist text-lg font-semibold text-foreground">
            Your Personal Link
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Share to get paid
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0"
          aria-label="More options"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
        </div>
        <span className="min-w-0 flex-1 truncate font-medium text-foreground">
          {link}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            aria-label="Copy"
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Link href={ROUTES.RECEIVE} aria-label="QR code">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <QrCode className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Share"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {copied && (
        <p className="mt-2 text-xs text-primary">Copied to clipboard</p>
      )}
    </div>
  );
}
