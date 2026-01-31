"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MenuIcon, XIcon } from "lucide-react";

import { landingLinks } from "@/data/landing/links";
import { ROUTES } from "@/lib/constants/routes";
import type { LandingLink } from "@/types/landing";

import AnimatedContent from "./animated-content";

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (!isHome) return null;

  return (
    <>
      <AnimatedContent reverse>
        <nav className="fixed left-0 right-0 top-0 z-50 border-b border-neutral-300 bg-white/95 px-4 py-4 transition-all duration-300 backdrop-blur md:px-16 lg:px-24 xl:px-32">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/">
              <Image
                src="/assets/logo.svg"
                alt="Cypher Logo"
                width={135}
                height={36}
              />
            </Link>

            <div className="hidden md:flex md:gap-3">
              {landingLinks.map((link: LandingLink) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-3 py-1 text-gray-800 hover:text-zinc-500"
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
              className="hidden rounded-full bg-orange-500 px-6 py-2.5 text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.6)] md:inline-block"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </AnimatedContent>
      <div
        className={`fixed right-0 top-0 z-[60] w-full overflow-hidden bg-white shadow-xl shadow-black/5 transition-all duration-300 ease-in-out ${isMenuOpen ? "h-[23rem]" : "h-0"}`}
      >
        <div className="flex items-center justify-between p-4">
          <Image
            src="/assets/logo.svg"
            alt="Cypher Logo"
            width={135}
            height={36}
          />
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
            className="w-max rounded-full bg-gradient-to-tl from-orange-600 to-orange-500 px-6 py-2.5 text-sm text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.6)]"
            onClick={() => setIsMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </>
  );
}
