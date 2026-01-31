"use client";

import Image from "next/image";

import { InstagramIcon, LinkedinIcon, TwitterIcon } from "lucide-react";

import AnimatedContent from "./animated-content";

export default function LandingFooter() {
  return (
    <footer className="px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="mx-auto max-w-7xl border-x border-gray-200 px-4 pt-40 md:px-12">
        <div className="relative flex flex-col overflow-hidden rounded-t-2xl bg-gradient-to-t from-orange-50 to-orange-100 p-8 pb-32 md:flex-row md:items-start md:justify-between md:p-12 md:pb-[10.5rem]">
          <Image
            src="/assets/logo-colored.svg"
            alt="Logo"
            width={135}
            height={35}
            className="absolute -bottom-[4.5rem] left-0 h-[15.5rem] w-auto select-none opacity-[0.07] pointer-events-none"
          />
          <AnimatedContent distance={40} className="max-w-72">
            <Image
              src="/assets/logo-colored.svg"
              alt="Cypher Logo"
              width={135}
              height={35}
              className="h-9"
            />
            <p className="mt-4 pb-6 text-zinc-500">
              For further assistance or additional inquiries, feel free to
              contact us.
            </p>
          </AnimatedContent>
          <div>
            <p className="text-base font-semibold uppercase text-orange-600">
              Social
            </p>
            <AnimatedContent className="mt-6 flex flex-col gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-orange-500"
              >
                <TwitterIcon size={20} />
                <p>Twitter</p>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-orange-500"
              >
                <LinkedinIcon size={20} />
                <p>Linkedin</p>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-orange-500"
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
