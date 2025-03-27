"use client";
import { easeOut, motion, useTransform } from "motion/react";

import { HomeSection } from "@/components/landing/HomeSection";
import { ScrollDown } from "@/components/landing/ScrollDown";
import { Button } from "@/components/landing/Button";
import { DiscordIcon } from "@/components/landing/DiscordIcon";

// import bg1 from "/public/landing/home-section-1-bg.webp";
// import bg2 from "/public/landing/home-section-2-bg.webp";
// import bg3 from "/public/landing/home-section-3-bg.webp";
// import fg3 from "/public/landing/home-section-3-fg.webp";
// import bg4 from "/public/landing/home-section-4-bg.webp";
// import bg5 from "/public/landing/home-section-5-bg.webp";
// import bg6 from "/public/landing/home-section-6-bg.webp";
// import bg7 from "/public/landing/home-section-7-bg.webp";
// import fg5 from "/public/landing/home-section-5-fg.webp";
// import fg61 from "/public/landing/home-section-6-fg-1.webp";
// import fg62 from "/public/landing/home-section-6-fg-2.webp";
// import fg63 from "/public/landing/home-section-6-fg-3.webp";
// import fg7 from "/public/landing/home-section-7-fg.webp";

export function meta() {
  return [
    {
      title: "Hydros — NFT Collection on Hyperliquid",
    },
    {
      name: "description",
      content:
        "Meet Hydros, the Heroes of the Deep, a high-quality NFT collection launching on Hyperliquid",
    },
  ];
}

export default function Home() {
  return (
    <div className="w-full md:mt-[-94px] mt-[-82px]">
      <HomeSection
        className="flex items-center justify-center"
        backgroundUrl={'/landing/home-section-1-bg.webp'}
      >
        {({ progress }) => (
          <>
            <motion.h1
              className="text-center"
              style={{
                y: useTransform(progress, [0, 1], [200, -200]),
                opacity: useTransform(progress, [0, 0.5, 1], [0, 1, 0]),
              }}
            >
              <span className="text-3xl md:text-5xl font-herculanum text-green">
                Sometimes, we see clearer
              </span>
              <br />
              <span className="text-4xl md:text-8xl font-herculanum text-white">
                In the deep
              </span>
            </motion.h1>

            <ScrollDown />
          </>
        )}
      </HomeSection>

      <HomeSection
        className="flex items-center justify-center"
        backgroundUrl={'/landing/home-section-2-bg.webp'}
      >
        {({ progress }) => (
          <motion.h2
            className="text-center text-2xl md:text-4xl font-herculanum text-green"
            style={{
              y: useTransform(progress, [0, 1], [200, -200]),
              opacity: useTransform(progress, [0, 0.5, 1], [0, 1, 0]),
            }}
          >
            our realm has been attacked <br className="contents md:inline" /> by
            dark forces,{" "}
            <span className="text-white underline">The Liquidators</span>
          </motion.h2>
        )}
      </HomeSection>

      <HomeSection
        className="flex items-center justify-start overflow-hidden"
        backgroundUrl={'/landing/home-section-3-bg.webp'}
      >
        {({ progress }) => (
          <>
            <motion.h2
              className="text-2xl md:text-4xl font-herculanum text-green text-center md:text-left uppercase relative z-10"
              style={{
                y: useTransform(progress, [0, 1], [200, -200]),
                opacity: useTransform(progress, [0, 0.5, 1], [0, 1, 0]),
              }}
            >
              They want to steal{" "}
              <span className="text-white underline">the Aqualium</span>,
              <br className="contents md:inline" />
              The essence of Hydros Power and
              <br className="contents md:inline" /> the cradle of our existence
            </motion.h2>

            <motion.div
              className="z-0 absolute bottom-0 left-1/2 -ml-[200px] aspect-[1065/906] w-[532px] md:w-[1065px] bg-contain"
              style={{
                backgroundImage: `url(/landing/home-section-3-fg.webp)`,
                y: useTransform(progress, [0.2, 0.65], ["100%", "0%"], {
                  ease: easeOut,
                }),
                x: useTransform(progress, [0.2, 0.65], ["20%", "0%"], {
                  ease: easeOut,
                }),
              }}
            />
          </>
        )}
      </HomeSection>

      <HomeSection className="flex items-end justify-start" backgroundUrl={'/landing/home-section-4-bg.webp'}>
        {({ progress }) => (
          <motion.h2
            className="text-2xl md:text-4xl text-center md:text-left font-herculanum text-green"
            style={{
              y: useTransform(progress, [0, 1], [200, -200]),
              opacity: useTransform(progress, [0, 0.5, 1], [0, 1, 0]),
            }}
          >
            They’re unleashing <br className="contents md:inline" />
            <span className="text-white">all the magic and creatures</span>
            <br className="contents md:inline" /> they have.
          </motion.h2>
        )}
      </HomeSection>

      <HomeSection className="flex items-start justify-end" backgroundUrl={'/landing/home-section-5-bg.webp'}>
        {({ progress }) => (
          <>
            <motion.h2
              className="mt-28 text-2xl md:text-4xl font-herculanum text-center md:text-right text-green relative z-10"
              style={{
                y: useTransform(progress, [0, 1], [200, -200]),
                opacity: useTransform(progress, [0, 0.5, 1], [0, 1, 0]),
              }}
            >
              We won’t let this happen...
              <br className="contents md:inline" />
              <span className="text-white">
                We’re Hydros, the heroes of the Deep
              </span>
            </motion.h2>

            <motion.div
              className="left-0 bottom-0 absolute aspect-[861/867] w-[430px] md:w-[861px] bg-contain z-0"
              style={{
                backgroundImage: `url(/landing/home-section-5-fg.webp)`,
                x: useTransform(progress, [0, 0.5], ["-50%", "0%"], {
                  ease: easeOut,
                }),
              }}
            />
          </>
        )}
      </HomeSection>

      <HomeSection
        className="flex items-center justify-center"
        backgroundUrl={'/landing/home-section-6-bg.webp'}
      >
        {({ progress }) => (
          <div className="flex flex-col gap-32">
            <motion.div
              className="flex items-center justify-center gap-28"
              style={{
                opacity: useTransform(progress, [0, 0.5, 1], [0, 1, 0]),
                y: useTransform(progress, [0, 1], [100, -100]),
              }}
            >
              <motion.div
                className="hidden md:block aspect-[275/86] w-[275px] bg-contain"
                style={{
                  backgroundImage: `url(/home-section-6-fg-1.webp)`,
                  x: useTransform(progress, [0, 0.5], [-50, 0]),
                }}
              />

              <motion.div
                className="aspect-[471/180] w-full max-w-[471px] bg-contain"
                style={{
                  backgroundImage: `url(/home-section-6-fg-2.webp)`,
                }}
              />

              <motion.div
                className="hidden md:block aspect-[201/174] w-[201px] bg-contain"
                style={{
                  backgroundImage: `url(/home-section-6-fg-3.webp)`,
                  x: useTransform(progress, [0, 0.5], [50, 0]),
                }}
              />
            </motion.div>

            <motion.h2
              className="text-2xl md:text-4xl font-herculanum text-center text-green"
              style={{
                y: useTransform(progress, [0, 1], [200, -200]),
                opacity: useTransform(progress, [0, 0.5, 1], [0, 1, 0]),
              }}
            >
              We’ve got the weapons, We’ve got the power,
              <br className="contents md:inline" />
              <span className="text-white">
                Victory is the only way forward.
              </span>
            </motion.h2>
          </div>
        )}
      </HomeSection>

      <HomeSection
        className="flex items-center justify-start"
        backgroundUrl={'/landing/home-section-7-bg.webp'}
      >
        {({ progress }) => (
          <>
            <div className="flex flex-col gap-16 items-start relative z-10">
              <motion.h2
                className="text-2xl md:text-4xl font-herculanum text-center md:text-left text-green"
                style={{
                  y: useTransform(progress, [0, 1], [200, -200]),
                  opacity: useTransform(progress, [0, 0.5, 1], [0, 1, 0]),
                }}
              >
                We’re recruiting more fighters
                <br className="contents md:inline" />
                to strengthen our ranks.
                <br className="contents md:inline" />
                <br className="contents md:inline" />
                <span className="text-white">Do you have what it takes?</span>
              </motion.h2>

              <motion.div
                style={{
                  y: useTransform(progress, [0, 1], [300, -300]),
                  opacity: useTransform(progress, [0.3, 0.5, 1], [0, 1, 0]),
                }}
              >
                <Button asChild>
                  <a href="https://discord.hydros.world" target="_blank">
                    <DiscordIcon className="fill-black w-5 shrink-0" /> Join us
                    in the fight for victory
                  </a>
                </Button>
              </motion.div>
            </div>

            <motion.div
              className="absolute bottom-0 left-1/4 md:left-1/2 aspect-[659/655] w-[329px] md:w-[659px] bg-contain z-0"
              style={{
                backgroundImage: `url(/landing/home-section-7-fg.webp)`,
                y: useTransform(progress, [0, 0.5], ["100%", "0%"], {
                  ease: easeOut,
                }),
                x: useTransform(progress, [0, 0.5], ["-20%", "0%"], {
                  ease: easeOut,
                }),
              }}
            />
          </>
        )}
      </HomeSection>
    </div>
  );
}
