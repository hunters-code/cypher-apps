"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
}

export function BackButton({ href, onClick }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}
