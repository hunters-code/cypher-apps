import type { LucideIcon } from "lucide-react";

export interface LandingLink {
  name: string;
  href: string;
}

export interface LandingSectionTitle {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  dir?: "left" | "center";
}

export interface LandingFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  cardBg?: string;
  iconBg?: string;
}

export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingCustomIcon {
  icon: LucideIcon;
  dir?: "left" | "right";
}
