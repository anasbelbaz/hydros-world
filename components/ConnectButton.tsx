"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

import { Button } from "./ui/button";
import { HypeLogo } from "@/lib/utils/utils";
import { useUserBalance } from "@/lib/hooks/useUserBalance";
import { Avatar } from "@/lib/utils/utils";
import { ENV } from "@/lib/env";

export function ConnectButton() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { address } = useAccount();
  const { data: userBalance } = useUserBalance();

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
      ? `${addr.slice(0, 4)}...${addr.slice(-4).toUpperCase()}.HL`
      : `${addr.slice(0, 6)}...${addr.slice(-6).toUpperCase()}.HL`;
  };

  // Only render the actual content after component has mounted on the client
  // This avoids hydration mismatches
  if (!isMounted) {
    return (
      <div className="opacity-0">
        <Button>{isMobile ? "Connect" : "CONNECT WALLET"}</Button>
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
                  <Button onClick={openConnectModal} type="button">
                    {isMobile ? "Connect" : "CONNECT WALLET"}
                  </Button>
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
                      className="uppercase font-herculanum text-xs lg:text-sm text-[#98FCE4]"
                      style={{ fontFamily: "'Herculanum', sans-serif" }}
                    >
                      {formatAddress(address || "")}
                    </span>
                    <div className="bg-transparent px-2 rounded-full flex items-center space-x-1 border border-[#98FCE4]/30">
                      <span
                        className="text-[#98FCE4] font-herculanum text-xs lg:text-sm"
                        style={{ fontFamily: "'Herculanum', sans-serif" }}
                      >
                        {userBalance?.nativeBalance
                          ? Number(
                              formatUnits(userBalance.nativeBalance, 18)
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
