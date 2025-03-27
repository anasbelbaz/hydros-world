import { Root } from "@radix-ui/react-slot";
import type { ReactNode } from "react";

export function Button({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: ReactNode;
}) {
  const Component = asChild ? Root : "button";

  return (
    <Component className="bg-green px-8 py-4 rounded-full flex gap-4 items-center font-serif text-black text-base">
      {children}
    </Component>
  );
}
