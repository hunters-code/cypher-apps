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
      <>
        <LenisScroll />
        <LandingNavbar />
        {children}
        <LandingFooter />
      </>
    );
  }

  return <MobileContainer>{children}</MobileContainer>;
}
