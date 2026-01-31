"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { usePrivy } from "@privy-io/react-auth";

import { ROUTES } from "@/lib/constants/routes";
import FaqSection from "@/sections/landing/faq-section";
import FeaturesSection from "@/sections/landing/features-section";
import HeroSection from "@/sections/landing/hero-section";
import StatsSection from "@/sections/landing/stats-section";

export default function Home() {
  const router = useRouter();
  const { authenticated, ready } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return null;
  }

  if (authenticated) {
    return null;
  }

  return (
    <main>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <FaqSection />
    </main>
  );
}
