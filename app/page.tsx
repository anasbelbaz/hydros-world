"use client";

import { motion } from "framer-motion";
import { PriceTable } from "@/components/PriceTable";
import { FloatingParticles } from "@/components/FloatingParticles";

export default function Home() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col pt-30 relative">
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
          <Countdown />
        </motion.div>

        {/* Main content grid - switches to 2 columns on lg screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full">
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

              <button
                className="whitelist-button mb-16 cursor-pointer"
                onClick={() => console.log("Whitelist clicked")}
              >
                WHITELIST
              </button>
            </div>
            <PriceTable />
          </motion.div>

          {/* Countdown is hidden on mobile/md, only visible in lg screens */}
          <motion.div className="hidden lg:flex items-center justify-center">
            <Countdown />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Countdown() {
  return (
    <div className="text-center relative overflow-visible min-h-[280px] sm:min-h-[320px]">
      {/* Pre-launch circle as absolutely positioned element with background image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.8 }}
        className="absolute w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[550px] md:h-[550px] lg:w-[648px] lg:h-[648px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: "url('/images/pre-launch-circle.png')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></motion.div>
      <div className="relative z-10 py-4">
        <h2 className="text-white font-herculanum uppercase text-xl sm:text-2xl mb-4 sm:mb-6">
          LAUNCH IN
        </h2>
        <div className="flex items-end justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="flex items-center">
            <span className="countdown-digit">2</span>
            <span className="countdown-label">D</span>
          </div>
          <div className="flex items-center">
            <span className="countdown-digit">12</span>
            <span className="countdown-label">H</span>
          </div>
          <div className="flex items-center">
            <span className="countdown-digit">30</span>
            <span className="countdown-label">M</span>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 text-white font-herculanum text-lg sm:text-xl uppercase">
          MARCH 31ST 2025
        </div>
      </div>
    </div>
  );
}
