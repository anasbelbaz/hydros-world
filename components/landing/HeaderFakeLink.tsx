import type { ReactNode } from "react";

export function HeaderFakeLink({ children }: { children: ReactNode }) {
  return (
    <a
      className="font-serif font-herculanum text-base text-white opacity-50 h-10 flex items-center"
      aria-disabled
    >
      {children}
    </a>
  );
}
