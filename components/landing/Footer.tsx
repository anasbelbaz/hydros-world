import { DiscordIcon } from "./DiscordIcon";
import { XIcon } from "./XIcon";

export function Footer() {
  return (
    <footer className="fixed flex justify-center w-full bottom-0 pb-4 md:pb-8 px-5 md:px-10 z-20">
      <div className="w-full flex justify-end max-w-container-lg">
        <div className="bg-green/20 px-5 py-3 rounded-3xl flex items-center gap-8 backdrop-blur-md">
          {/* <nav className="flex items-center gap-3">
            <ul>
              <li>
                <a
                  href="#"
                  className="font-serif text-green text-base uppercase"
                >
                  Docs
                </a>
              </li>
            </ul>

            <ul>
              <li>
                <a
                  href="#"
                  className="font-serif text-green text-base uppercase"
                >
                  Help
                </a>
              </li>
            </ul>
          </nav> */}

          <nav>
            <ul className="flex items-center gap-6">
              <li>
                <a href="https://discord.hydros.world" target="_blank">
                  <DiscordIcon className="w-5 fill-white" />
                </a>
              </li>

              <li>
                <a href="https://x.hydros.world" target="_blank">
                  <XIcon className="w-5 fill-white" />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
