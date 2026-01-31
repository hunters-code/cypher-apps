"use client";

import { useMemo } from "react";

import Link from "next/link";

import { usePrivy } from "@privy-io/react-auth";
import { ArrowUpRightIcon, SparkleIcon } from "lucide-react";

import AnimatedContent from "@/components/landing/animated-content";
import SectionTitle from "@/components/landing/section-title";
import { landingFeatures } from "@/data/landing/features";
import { ROUTES } from "@/lib/constants/routes";
import { hasSession } from "@/lib/utils/session";

export default function FeaturesSection() {
  const { authenticated, ready } = usePrivy();

  const appLink = useMemo(() => {
    if (ready && authenticated && hasSession()) {
      return ROUTES.DASHBOARD;
    }
    return ROUTES.LOGIN;
  }, [ready, authenticated]);
  return (
    <section id="features" className="px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 border-x border-border md:grid-cols-2 md:divide-x md:divide-border">
        <div>
          <div className="flex flex-col items-start p-4 pt-16 md:sticky md:top-[6.5rem] md:p-16">
            <SectionTitle
              dir="left"
              icon={SparkleIcon}
              title="Core features"
              subtitle="Everything you need for private crypto—stealth addresses, usernames, and on-chain privacy without exposing your activity."
            />
            <AnimatedContent className="mt-12 w-full rounded-xl bg-brand p-4 md:p-6">
              <p className="text-lg text-brand-foreground">
                Trusted by users who want cash-level privacy on the blockchain.
              </p>
              <Link
                href={appLink}
                className="mt-6 flex w-max items-center gap-1 rounded-xl bg-brand-foreground px-5 py-2.5 text-brand font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:opacity-95"
              >
                Go to App
                <ArrowUpRightIcon size={20} />
              </Link>
            </AnimatedContent>
          </div>
        </div>
        <div className="space-y-6 p-4 pt-16 md:p-16">
          {landingFeatures.map((feature, index) => (
            <AnimatedContent
              key={index}
              className={`${feature.cardBg ?? "bg-muted"} flex w-full flex-col items-start rounded-xl p-6 md:sticky md:top-[6.5rem]`}
            >
              <div
                className={`${feature.iconBg ?? "bg-brand"} rounded-md p-2 text-brand-foreground`}
              >
                <feature.icon size={24} />
              </div>
              <p className="mt-4 text-base font-medium">{feature.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}
