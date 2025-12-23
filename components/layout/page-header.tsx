"use client";

import { useRouter } from "next/navigation";

import { X } from "lucide-react";

import { BackButton } from "@/components/layout/back-button";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  backHref?: string;
  onBack?: () => void;
  onClose?: () => void;
  closeHref?: string;
  showClose?: boolean;
}

export function PageHeader({
  backHref,
  onBack,
  onClose,
  closeHref,
  showClose = true,
}: PageHeaderProps) {
  const router = useRouter();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (closeHref) {
      router.push(closeHref);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <BackButton href={backHref} onClick={onBack} />
      {showClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
