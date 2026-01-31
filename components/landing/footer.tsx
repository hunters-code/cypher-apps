"use client";

import { InstagramIcon, LinkedinIcon, TwitterIcon } from "lucide-react";

import { Logo } from "@/components/shared/logo";

import AnimatedContent from "./animated-content";

export default function LandingFooter() {
  return (
    <footer className="px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="mx-auto max-w-7xl border-x border-border px-4 pt-40 md:px-12">
        <div className="relative flex flex-col overflow-hidden rounded-t-2xl bg-linear-to-t from-muted to-muted/50 p-8 pb-32 md:flex-row md:items-start md:justify-between md:p-12 md:pb-[10.5rem]">
          <div className="absolute -bottom-18 left-0 h-62 w-auto select-none opacity-[0.07] pointer-events-none">
            <Logo width={135} height={135} />
          </div>
          <AnimatedContent distance={40} className="max-w-72">
            <div className="flex items-center gap-4">
              <Logo />
              <span className="text-xl font-bold text-foreground">Cypher</span>
            </div>
            <p className="mt-4 pb-6 text-muted-foreground">
              For further assistance or additional inquiries, feel free to
              contact us.
            </p>
          </AnimatedContent>
          <div>
            <p className="text-base font-semibold uppercase text-foreground">
              Social
            </p>
            <AnimatedContent className="mt-6 flex flex-col gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-muted-foreground"
              >
                <TwitterIcon size={20} />
                <p>Twitter</p>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-muted-foreground"
              >
                <LinkedinIcon size={20} />
                <p>Linkedin</p>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground hover:text-muted-foreground"
              >
                <InstagramIcon size={20} />
                <p>Instagram</p>
              </a>
            </AnimatedContent>
          </div>
        </div>
      </div>
    </footer>
  );
}
