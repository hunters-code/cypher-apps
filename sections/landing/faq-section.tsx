import Link from "next/link";

import { ChevronDownIcon, CircleQuestionMarkIcon } from "lucide-react";

import AnimatedContent from "@/components/landing/animated-content";
import SectionTitle from "@/components/landing/section-title";
import { landingFaqs } from "@/data/landing/faqs";
import { ROUTES } from "@/lib/constants/routes";

export default function FaqSection() {
  return (
    <section className="border-y border-border">
      <div className="px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center border-x border-border p-4 pt-20 md:p-20">
          <SectionTitle
            icon={CircleQuestionMarkIcon}
            title="Got questions?"
            subtitle="Everything you need to know about Cypher, stealth addresses, and how to get started."
          />
        </div>
      </div>
      <div className="border-t border-border px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 border-x border-border md:grid-cols-2 md:divide-x md:divide-border">
          <div className="space-y-6 p-4 pt-20 md:p-20">
            {landingFaqs.map((faq, index) => (
              <AnimatedContent key={index}>
                <details
                  className="group rounded-xl border border-border bg-muted"
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer select-none items-center justify-between p-6">
                    <h3 className="text-base font-medium">{faq.question}</h3>
                    <ChevronDownIcon
                      size={20}
                      className="shrink-0 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="max-w-md p-6 pt-0 text-sm leading-6 text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              </AnimatedContent>
            ))}
          </div>
          <div className="p-4 pt-20 md:p-20">
            <div className="sticky top-[7.5rem] mt-12 flex w-full items-center justify-between gap-5 rounded-xl bg-primary p-6">
              <h3 className="text-balance text-lg text-primary-foreground">
                Still have questions? We can help you get started.
              </h3>
              <Link
                href={ROUTES.LOGIN}
                className="shrink-0 rounded-xl bg-primary-foreground px-5 py-2.5 font-medium text-primary shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] hover:opacity-95"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
