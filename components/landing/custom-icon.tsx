import type { LandingCustomIcon } from "@/types/landing";

export default function CustomIcon({
  icon: Icon,
  dir = "left",
}: LandingCustomIcon) {
  return (
    <div
      className={`bg-orange-500 p-2 aspect-square rounded-lg text-white shadow-[inset_0_4px_4px_rgba(255,255,255,0.25),0_4px_10px_rgba(0,0,0,0.15)] ${dir === "left" ? "-rotate-15" : "rotate-15"}`}
    >
      <Icon size={24} />
    </div>
  );
}
