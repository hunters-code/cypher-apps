"use client";

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MenuIcon, XIcon } from "lucide-react";

import { landingLinks } from "@/data/landing/links";
import { ROUTES } from "@/lib/constants/routes";
import type { LandingLink } from "@/types/landing";

import AnimatedContent from "./animated-content";
import { Logo } from "../shared/logo";

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (!isHome) return null;

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150 px-4 py-4 transition-all duration-300 md:px-16 lg:px-24 xl:px-32">
        <AnimatedContent reverse>
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-4">
                <Logo />
                <span className="text-xl font-bold text-foreground">
                  Cypher
                </span>
              </div>
            </Link>

            <div className="hidden md:flex md:gap-3">
              {landingLinks.map((link: LandingLink) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-3 py-1 text-foreground hover:text-muted-foreground"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <button
              type="button"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <MenuIcon className="size-6.5" />
            </button>

            <Link
              href={ROUTES.LOGIN}
              className="hidden rounded-full bg-brand px-6 py-2.5 text-brand-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] md:inline-block"
            >
              Get Started
            </Link>
          </div>
        </AnimatedContent>
      </nav>
      <div
        className={`fixed right-0 top-0 z-[60] w-full overflow-hidden bg-white/10 backdrop-blur-xl backdrop-saturate-150 border-b border-white/10 shadow-xl shadow-black/5 transition-all duration-300 ease-in-out ${isMenuOpen ? "h-[23rem]" : "h-0"}`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="text-xl font-bold text-foreground">Cypher</span>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <XIcon className="size-6.5" />
          </button>
        </div>
        <div className="flex flex-col gap-4 p-4 text-base">
          {landingLinks.map((link: LandingLink) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-3 py-1"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href={ROUTES.LOGIN}
            className="w-max rounded-full bg-brand px-6 py-2.5 text-sm text-brand-foreground shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
            onClick={() => setIsMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
