import type { LandingSectionTitle } from "@/types/landing";

import AnimatedContent from "./animated-content";
import CustomIcon from "./custom-icon";

export default function SectionTitle({
  icon,
  title,
  subtitle,
  dir = "center",
}: LandingSectionTitle) {
  return (
    <div
      className={`flex flex-col gap-6 ${dir === "center" ? "items-center text-center" : "md:items-start items-center"}`}
    >
      <AnimatedContent className="flex flex-col md:flex-row items-center gap-4">
        <CustomIcon icon={icon} />
        <h2 className="font-urbanist text-4xl font-semibold">{title}</h2>
      </AnimatedContent>
      <AnimatedContent>
        <p
          className={`text-base leading-7 text-muted-foreground ${dir === "center" ? "text-center max-w-lg" : "md:text-left text-center max-w-sm"}`}
        >
          {subtitle}
        </p>
      </AnimatedContent>
    </div>
  );
}
