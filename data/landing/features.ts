import {
  ShieldCheckIcon,
  UserCircleIcon,
  ZapIcon,
  LockIcon,
  EyeOffIcon,
  WalletIcon,
} from "lucide-react";

import type { LandingFeature } from "@/types/landing";

export const landingFeatures: LandingFeature[] = [
  {
    title: "Stealth Addresses",
    description:
      "Send to usernames without exposing wallet addresses. Recipients get funds to a one-time stealth address only they can derive.",
    icon: UserCircleIcon,
    cardBg: "bg-orange-100",
    iconBg: "bg-orange-500",
  },
  {
    title: "Private Balances",
    description:
      "Your balance and transaction history stay off public ledgers. Only you see what you hold and where it went.",
    icon: EyeOffIcon,
    cardBg: "bg-green-100",
    iconBg: "bg-green-500",
  },
  {
    title: "Send by Username",
    description:
      "No long addresses to copy. Send to a simple username; we handle the stealth math on-chain.",
    icon: ZapIcon,
    cardBg: "bg-indigo-100",
    iconBg: "bg-indigo-500",
  },
  {
    title: "Recovery & Security",
    description:
      "Recover access with your chosen method. Keys and metadata stay under your control with built-in safeguards.",
    icon: LockIcon,
    cardBg: "bg-pink-100",
    iconBg: "bg-pink-500",
  },
  {
    title: "On-Chain Privacy",
    description:
      "Leverage stealth announcements and registries on Base so transactions don't link back to your identity.",
    icon: ShieldCheckIcon,
    cardBg: "bg-lime-100",
    iconBg: "bg-lime-500",
  },
  {
    title: "Simple Wallet UX",
    description:
      "Familiar send, receive, and scan flows with QR and usernames—privacy without complexity.",
    icon: WalletIcon,
    cardBg: "bg-gray-50",
    iconBg: "bg-orange-500",
  },
];
