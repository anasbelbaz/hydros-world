import type { ReactNode } from "react";
import { NavLink, type To } from "react-router";

export function HeaderLink({ to, children }: { to: To; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      className="font-serif font-herculanum text-base text-white h-10 flex items-center relative"
    >
      {({ isActive }) => (
        <>
          <span className="font-serif font-herculanum text-base text-white">
            {children}
          </span>

          {isActive && (
            <div className="h-0.5 bg-green bottom-0 absolute inset-x-0" />
          )}
        </>
      )}
    </NavLink>
  );
}
