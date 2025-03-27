import { HeaderLink } from "./HeaderLink";
import { HeaderFakeLink } from "./HeaderFakeLink";
import { LogoIcon } from "./LogoIcon";
import { NavLink } from "react-router";

export function Header() {
  return (
    <header className="flex justify-center fixed w-full pt-6 px-5 md:px-10 z-20">
      <div className="max-w-container-lg flex items-center w-full">
        <nav className="flex-1">
          <ul className="flex items-center gap-10">
            <li>
              <HeaderLink to="/">Home</HeaderLink>
            </li>

            <li>
              <HeaderFakeLink>Mint</HeaderFakeLink>
            </li>

            <li>
              <HeaderFakeLink>Trade</HeaderFakeLink>
            </li>
          </ul>
        </nav>

        <NavLink to="/">
          <LogoIcon className="fill-white w-28" />
        </NavLink>

        <div className="hidden md:block flex-1" />
      </div>
    </header>
  );
}
