"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  label?: string;
}

export function BackButton({
  href,
  onClick,
  className,
  label,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (!href) {
      router.back();
    }
  };

  const buttonProps = {
    variant: "ghost" as const,
    size: "sm" as const,
    className: cn("gap-2", className),
    "aria-label": label || "Go back",
    onClick: href ? undefined : handleClick,
  };

  if (href) {
    return (
      <Button asChild {...buttonProps}>
        <Link href={href}>
          <ArrowLeft className="h-4 w-4" />
          {label && <span>{label}</span>}
        </Link>
      </Button>
    );
  }

  return (
    <Button {...buttonProps}>
      <ArrowLeft className="h-4 w-4" />
      {label && <span>{label}</span>}
    </Button>
  );
}

