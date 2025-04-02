"use client";

import React from "react";
import { motion } from "framer-motion";

import { PriceTable } from "@/components/PriceTable";
import { FloatingParticles } from "@/components/FloatingParticles";
import { useUserInfos } from "@/lib/hooks/useUserInfos";
import { Button } from "./ui/button";

export default function AuctionNotStarted() {
  const { data: userInfos } = useUserInfos();
  const isWhitelisted = userInfos?.isWhitelisted;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-6 pb-12 flex flex-col justify-center relative">
      <FloatingParticles />
      {/* Tables and Countdown */}
      <div className="flex flex-col w-full">
        {/* Countdown - Displayed first on mobile/md screens */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center mb-8 md:mb-12 lg:hidden"
        >
          <RightContent />
        </motion.div>

        {/* Main content grid - switches to 2 columns on lg screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full">
          {isWhitelisted ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col items-center justify-center sm:pt-4 ">
                <span className="text-white font-herculanum text-sm sm:text-base uppercase tracking-widest mb-2">
                  YOU ARE A
                </span>
                <h1 className="hydros-title text-4xl mb-8 text-center">
                  CITIZEN OF HYDROPOLIS
                </h1>
              </div>
              <PriceTable />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col items-center justify-center sm:pt-4 ">
                <span className="text-white font-herculanum text-sm sm:text-base uppercase tracking-widest mb-2">
                  JOIN THE FIGHT ON DISCORD AND
                </span>
                <h1 className="hydros-title text-4xl mb-8 text-center">
                  BECOME A CITIZEN
                </h1>

                <motion.div
                  whileHover={{ scale: 0.95 }}
                  whileTap={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 600, damping: 20 }}
                  className="mb-16"
                >
                  <Button
                    className="relative overflow-hidden group cursor-pointer"
                    onClick={() => console.log("Discord clicked")}
                  >
                    <span className="z-10 flex items-center gap-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-discord"
                        viewBox="0 0 16 16"
                      >
                        <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
                      </svg>
                      TRY TO CATCH UNREVEALED HYDROS on the marketplace 😰
                    </span>
                    <div className="group-hover:scale-100 opacity-40 transition-transform duration-500 absolute transform scale-0 bg-white min-h-full min-w-full aspect-square rounded-full inset-0 m-auto"></div>
                  </Button>
                </motion.div>
              </div>
              <PriceTable />
            </motion.div>
          )}

          {/* Countdown is hidden on mobile/md, only visible in lg screens */}
          <motion.div className="hidden lg:flex items-center justify-center">
            <RightContent />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function RightContent() {
  return (
    <div className="text-center relative overflow-visible w-full h-full flex justify-center items-center">
      {/* Pre-launch circle as absolutely positioned element with background image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.8 }}
        className="absolute animate-rotate w-full aspect-square pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: "url('/images/pre-launch-circle.png')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></motion.div>
      <div className="relative z-10 py-4">
        <h2 className="text-white font-herculanum uppercase text-xl sm:text-2xl mb-4 sm:mb-6">
          SOLD OUT
        </h2>
      </div>
    </div>
  );
}
