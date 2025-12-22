import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black py-0 sm:py-32">
      <main className="flex h-screen sm:h-[80vh] w-full flex-col items-center justify-between bg-white dark:bg-black sm:items-start sm:rounded-lg sm:shadow-lg sm:w-sm">
        {children}
      </main>
    </div>
  );
}

