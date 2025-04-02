"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { motion } from "framer-motion";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import { Button } from "./ui/button";
import { HypeLogo } from "@/lib/utils/utils";
import { useUserInfos } from "@/lib/hooks/useUserInfos";
import { Avatar } from "@/lib/utils/utils";
import { ENV } from "@/lib/env";

export function ConnectButton() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { address } = useAccount();
  const { data: userInfos } = useUserInfos();

  // Handle window resize to determine if mobile view should be used
  useEffect(() => {
    setIsMounted(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1080);
    };

    // Set initial value
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Format the address for display
  const formatAddress = (addr: string) => {
    if (!addr) return "";

    return isMobile
      ? `${addr.slice(0, 4)}...${addr.slice(-4).toUpperCase()}`
      : `${addr.slice(0, 6)}...${addr.slice(-6).toUpperCase()}`;
  };

  // Only render the actual content after component has mounted on the client
  // This avoids hydration mismatches
  if (!isMounted) {
    return (
      <div className="opacity-0">
        <Button>
          {isMobile ? (
            ""
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.3334 7.99984V5.33317H4.00008C3.64646 5.33317 3.30732 5.19269 3.05727 4.94265C2.80722 4.6926 2.66675 4.35346 2.66675 3.99984C2.66675 3.2665 3.26675 2.6665 4.00008 2.6665H12.0001V5.33317"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.66675 4V12C2.66675 12.7333 3.26675 13.3333 4.00008 13.3333H13.3334V10.6667"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0001 8C11.6465 8 11.3073 8.14048 11.0573 8.39052C10.8072 8.64057 10.6667 8.97971 10.6667 9.33333C10.6667 10.0667 11.2667 10.6667 12.0001 10.6667H14.6667V8H12.0001Z"
                stroke="black"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {isMobile ? "Connect" : "CONNECT WALLET"}
        </Button>
      </div>
    );
  }

  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted && isMounted;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!account) {
                return (
                  <motion.div
                    whileHover={{ scale: 0.95 }}
                    whileTap={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 600, damping: 20 }}
                    className="w-full max-w-[300px]"
                  >
                    <Button
                      onClick={openConnectModal}
                      type="button"
                      className="relative overflow-hidden group"
                    >
                      <span className="z-10 flex items-center gap-2">
                        {isMobile ? (
                          ""
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.3334 7.99984V5.33317H4.00008C3.64646 5.33317 3.30732 5.19269 3.05727 4.94265C2.80722 4.6926 2.66675 4.35346 2.66675 3.99984C2.66675 3.2665 3.26675 2.6665 4.00008 2.6665H12.0001V5.33317"
                              stroke="black"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M2.66675 4V12C2.66675 12.7333 3.26675 13.3333 4.00008 13.3333H13.3334V10.6667"
                              stroke="black"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12.0001 8C11.6465 8 11.3073 8.14048 11.0573 8.39052C10.8072 8.64057 10.6667 8.97971 10.6667 9.33333C10.6667 10.0667 11.2667 10.6667 12.0001 10.6667H14.6667V8H12.0001Z"
                              stroke="black"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        {isMobile ? "Connect" : "CONNECT WALLET"}
                      </span>
                      <div className="group-hover:scale-100 opacity-40 transition-transform duration-500 absolute transform scale-0 bg-white min-h-full min-w-full aspect-square rounded-full inset-0 m-auto"></div>
                    </Button>
                  </motion.div>
                );
              }

              if (chain?.id !== ENV.CHAIN_ID) {
                return (
                  <Button
                    onClick={openChainModal}
                    className="bg-primary/80 border border-primary/20 text-white font-herculanum px-4 py-2 rounded-md"
                  >
                    WRONG NETWORK
                  </Button>
                );
              }

              return (
                <div className="flex items-end gap-1">
                  <div className="flex flex-col items-end space-x-2">
                    <span
                      className="uppercase font-herculanum text-sm lg:text-base text-[#98FCE4]"
                      style={{ fontFamily: "'Herculanum', sans-serif" }}
                    >
                      {formatAddress(address || "")}
                    </span>
                    <div className="bg-transparent px-2 flex items-center space-x-1">
                      <span
                        className="font-herculanum text-sm lg:text-base"
                        style={{ fontFamily: "'Herculanum', sans-serif" }}
                      >
                        {userInfos?.nativeBalance
                          ? Number(
                              formatUnits(userInfos.nativeBalance, 18)
                            ).toFixed(2)
                          : "0.00"}
                      </span>
                      <HypeLogo />
                    </div>
                  </div>
                  <Avatar
                    onClick={() => {
                      console.log("clicked");
                      openAccountModal?.();
                    }}
                  />
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
