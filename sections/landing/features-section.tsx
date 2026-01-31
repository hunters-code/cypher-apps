import Link from "next/link";

import { ArrowUpRightIcon, SparkleIcon } from "lucide-react";

import AnimatedContent from "@/components/landing/animated-content";
import SectionTitle from "@/components/landing/section-title";
import { landingFeatures } from "@/data/landing/features";
import { ROUTES } from "@/lib/constants/routes";

export default function FeaturesSection() {
  return (
    <section id="features" className="px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 border-x border-gray-200 md:grid-cols-2 md:divide-x md:divide-gray-200">
        <div>
          <div className="flex flex-col items-start p-4 pt-16 md:sticky md:top-[6.5rem] md:p-16">
            <SectionTitle
              dir="left"
              icon={SparkleIcon}
              title="Core features"
              subtitle="Everything you need for private crypto—stealth addresses, usernames, and on-chain privacy without exposing your activity."
            />
            <AnimatedContent className="mt-12 w-full rounded-xl bg-orange-500 p-4 md:p-6">
              <p className="text-lg text-white">
                Trusted by users who want cash-level privacy on the blockchain.
              </p>
              <Link
                href={ROUTES.LOGIN}
                className="mt-6 flex w-max items-center gap-1 rounded-full bg-white px-5 py-2 hover:bg-gray-100"
              >
                Get started
                <ArrowUpRightIcon size={20} />
              </Link>
            </AnimatedContent>
          </div>
        </div>
        <div className="space-y-6 p-4 pt-16 md:p-16">
          {landingFeatures.map((feature, index) => (
            <AnimatedContent
              key={index}
              className={`${feature.cardBg ?? "bg-gray-50"} flex w-full flex-col items-start rounded-xl p-6 md:sticky md:top-[6.5rem]`}
            >
              <div
                className={`${feature.iconBg ?? "bg-orange-500"} rounded-md p-2 text-white`}
              >
                <feature.icon size={24} />
              </div>
              <p className="mt-4 text-base font-medium">{feature.title}</p>
              <p className="mt-2 text-sm text-gray-600">
                {feature.description}
              </p>
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  );
}
