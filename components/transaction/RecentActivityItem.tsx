import { ArrowUp, ArrowDown, Lock } from "lucide-react";
import { formatCryptoAmount } from "@/lib/utils/format";

interface RecentActivityItemProps {
  type: "SEND" | "RECEIVE";
  username: string;
  amount: string;
  token: string;
  timestamp: string;
  isPrivate?: boolean;
  onClick?: () => void;
}

export function RecentActivityItem({
  type,
  username,
  amount,
  token,
  timestamp,
  isPrivate = false,
  onClick,
}: RecentActivityItemProps) {
  const isSend = type === "SEND";
  const prefix = isSend ? "-" : "+";
  const Icon = isSend ? ArrowUp : ArrowDown;
  const formattedAmount = formatCryptoAmount(amount);
  const iconColor = isSend ? "text-destructive" : "text-green-600";
  const iconBg = isSend ? "bg-destructive/10" : "bg-green-600/10";

  return (
    <div
      className="border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-full ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium">
                {isSend ? "Sent to" : "Received from"} @{username}
              </span>
              {isPrivate && (
                <Lock className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className={`text-sm font-medium ${isSend ? "text-destructive" : "text-green-600"}`}>
            {prefix}{formattedAmount} {token}
          </span>
        </div>
      </div>
    </div>
  );
}

