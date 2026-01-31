"use client";

import { usePathname } from "next/navigation";

import LandingFooter from "@/components/landing/footer";
import LenisScroll from "@/components/landing/lenis";
import LandingNavbar from "@/components/landing/navbar";

import { MobileContainer } from "./mobile-container";

export function LandingLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return (
      <div className="flex min-h-screen flex-col">
        <LenisScroll />
        <LandingNavbar />
        <div className="flex flex-1 flex-col md:justify-center">{children}</div>
        <LandingFooter />
      </div>
    );
  }

  return <MobileContainer>{children}</MobileContainer>;
}
