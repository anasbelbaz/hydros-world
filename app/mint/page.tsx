"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PriceTable } from "@/components/PriceTable";
import {
  PHASE_AUCTION,
  PHASE_FINISHED,
  PHASE_INACTIVE,
  PHASE_WHITELIST,
} from "@/lib/abi/types";
import {
  ExtendedSalesInfo,
  useSaleInfoTestnet,
} from "@/lib/hooks/useSaleInfoTestnet";
import { useMint } from "@/lib/hooks/useMint";
import { Button } from "@/components/ui/button";
import { HypeLogo } from "@/lib/utils/utils";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Counter } from "@/components/Counter";
// import AuctionNotStarted from "@/components/AuctionNotStarted";
import { useUserInfos } from "@/lib/hooks/useUserInfos";
import TimeRemaining from "@/components/TimeRemaining";
import LiveView from "@/components/LiveView";
import AuctionNotStarted from "@/components/AuctionNotStarted";
// import AuctionNotStarted from "@/components/AuctionNotStarted";

export default function MintPage() {
  const queryClient = useQueryClient();
  const { data: userInfos } = useUserInfos();
  const { data: saleInfo, refetch, isRefetching } = useSaleInfoTestnet();

  const [mintAmount, setMintAmount] = useState(1);
  const [mintProgress, setMintProgress] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const { isConnected } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  // Use the hook at component level instead of inside handleMint
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Effect to handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["saleInfoTestnet"] });
      setMintProgress("success");

      // Show success toast
      toast.success(
        <div className="flex flex-col gap-1">
          <h3 className="font-herculanum">MINT SUCCESSFUL!</h3>
          <p className="text-sm font-herculanum">
            You minted {mintAmount} {mintAmount === 1 ? "HYDRO" : "HYDROS"}
          </p>
          <a
            href={`https://testnet.purrsec.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs underline mt-1 text-primary hover:text-primary/80"
          >
            View transaction
          </a>
        </div>
      );
    }

    if (mintProgress === "success") {
      setTimeout(() => {
        setMintProgress("idle");
      }, 1000);
    }
  }, [isConfirmed]);

  // Calculate NFTs left percentage
  const getNftLeftPercentage = () => {
    if (!saleInfo) return 100;
    const totalSupply = Number(saleInfo.totalSupply);
    const maxSupply = Number(saleInfo.maxSupply);

    if (maxSupply === 0) return 0;
    return ((maxSupply - totalSupply) / maxSupply) * 100;
  };

  const handleIncrement = () => {
    if (mintAmount < getMaxMintAmount()) {
      setMintAmount(mintAmount + 1);
    }
  };

  const handleDecrement = () => {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1);
    }
  };

  const getMaxMintAmount = () => {
    if (!saleInfo) return 1;

    // For whitelist phase
    if (saleInfo.currentPhase === PHASE_WHITELIST) {
      // If maxPerWallet is 0, it means unlimited - limit to 10 per tx for gas
      if (saleInfo.whitelistSaleConfig.maxPerWallet === BigInt(0)) {
        return 10; // Max 10 per transaction for gas efficiency
      }
      return Number(saleInfo.whitelistSaleConfig.maxPerWallet);
    }
    // For auction phase
    else {
      // If maxPerWallet is 0, it means unlimited - limit to 10 per tx for gas
      if (saleInfo.auctionSaleConfig.maxPerWallet === BigInt(0)) {
        return 10; // Max 10 per transaction for gas efficiency
      }
      console.log(
        "auctionSaleConfig.maxPerWallet",
        saleInfo.auctionSaleConfig.maxPerWallet
      );
      return Number(saleInfo.auctionSaleConfig.maxPerWallet);
    }
  };

  const getCurrentPrice = () => {
    if (!saleInfo) return "0";

    let unitPrice: bigint;

    // Get the current unit price based on the sale phase
    if (saleInfo.currentPhase === PHASE_WHITELIST) {
      unitPrice = saleInfo.whitelistSaleConfig.price;
    } else {
      unitPrice = saleInfo.currentPrice;
    }

    const unitFloatPrice = parseFloat(formatUnits(unitPrice, 18)).toFixed(4);
    const [integerPart, decimalPart] = unitFloatPrice.split(".");
    const priceWithDecimal = decimalPart
      ? `${integerPart}.<span class="decimal text-[10px]">${decimalPart.slice(
          0,
          4
        )}</span>` // Prendre les 4 premiers chiffres après la virgule
      : integerPart;

    return priceWithDecimal;
  };

  const getTotalPrice = () => {
    if (!saleInfo) return "0";

    let unitPrice: bigint;

    // Get the current unit price based on the sale phase
    if (saleInfo.currentPhase === PHASE_WHITELIST) {
      unitPrice = saleInfo.whitelistSaleConfig.price;
    } else {
      unitPrice = saleInfo.currentPrice;
    }

    const totalPrice = unitPrice * BigInt(mintAmount);
    const totalFloatPrice = parseFloat(formatUnits(totalPrice, 18)).toFixed(4);
    const [integerPart, decimalPart] = totalFloatPrice.split(".");
    const priceWithDecimal = decimalPart
      ? `${integerPart}.<span class="decimal text-base font-herculanum">${decimalPart.slice(
          0,
          4
        )}</span>` // Prendre les 4 premiers chiffres après la virgule
      : integerPart;

    return priceWithDecimal;
    // return parseFloat(formatUnits(totalPrice, 18)).toFixed(4);
  };

  const getPhaseTitle = () => {
    if (!saleInfo) return "MINT";

    switch (saleInfo.currentPhase) {
      case 1:
        return "PRIVATE SALE";
      case 2:
        return "PUBLIC SALE";
      default:
        return "MINT";
    }
  };

  const { executeMint } = useMint();

  const handleMint = async () => {
    if (!isConnected || mintAmount <= 0) return;

    try {
      setMintProgress("loading");

      // Show loading toast
      const loadingToast = toast.loading(
        <div className="flex flex-col gap-1">
          <h3 className="font-herculanum">MINTING IN PROGRESS</h3>
          <p className="text-sm">
            Minting {mintAmount} {mintAmount === 1 ? "HYDRO" : "HYDROS"}...
          </p>
        </div>
      );

      // In a production app, you would use the useMint hook here
      const tx = await executeMint({
        quantity: mintAmount,
        onSuccess: () => {
          // Success handled by useEffect with transaction confirmation
        },
        onError: () => {
          toast.dismiss(loadingToast);
          toast.error(
            <div className="flex flex-col gap-1">
              <h3 className="font-herculanum">MINT FAILED</h3>
              <p className="text-sm">
                There was an error during the minting process.
              </p>
            </div>
          );
          setMintProgress("error");
        },
      });

      // Set the transaction hash after we have it
      setTxHash(tx);

      // Dismiss loading toast once we have a transaction hash
      toast.dismiss(loadingToast);

      // Don't call hooks here - the state and useEffect will handle it
    } catch (err) {
      console.error("Mint error:", err);
      setMintProgress("error");

      // Show error toast
      toast.error(
        <div className="flex flex-col gap-1">
          <h3 className="font-herculanum">MINT FAILED</h3>
          <p className="text-sm">
            There was an error during the minting process.
          </p>
        </div>
      );
    }
  };

  if (!userInfos?.isWhitelisted && saleInfo?.currentPhase === PHASE_WHITELIST) {
    return <AuctionNotStarted />;
  }

  if (!userInfos?.isWhitelisted && saleInfo?.currentPhase !== PHASE_AUCTION) {
    return <AuctionNotStarted />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-6 flex flex-col justify-center relative">
      {/* Tables and Countdown */}

      <div className="flex flex-col w-full">
        {/* Main content grid - reordered columns on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 lg:order-1 flex flex-col justify-center gap-[4vh]" // Second on mobile, first on desktop
          >
            <div className="flex flex-col items-center justify-center gap-[4vh]">
              <div className="flex flex-col items-center">
                <span className="text-teal-50 font-herculanum text-sm sm:text-base uppercase tracking-widest mb-1">
                  {getPhaseTitle()}
                </span>
                <h1 className="hydros-title !text-3xl text-center">
                  CITIZEN OF HYDROPOLIS
                </h1>
              </div>
              <motion.div
                className="flex flex-col items-center gap-[4vh]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="-mb-4">
                  <Counter
                    amount={mintAmount}
                    handleIncrement={handleIncrement}
                    handleDecrement={handleDecrement}
                    getMaxAmount={getMaxMintAmount}
                  />
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 -mb-4">
                    <span className="text-teal-50 font-herculanum text-[33px]">
                      {isRefetching ? (
                        <motion.span
                          className="text-teal-50 font-herculanum text-[24px]"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "easeInOut",
                          }}
                        >
                          {saleInfo?.currentPhase === PHASE_WHITELIST
                            ? "Fetching price..."
                            : "Fetching new price..."}
                        </motion.span>
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: getTotalPrice(),
                          }}
                        />
                      )}
                    </span>{" "}
                    <HypeLogo className="w-[13px] h-[10px]" />
                  </div>
                  <div className="flex items-center gap-2 font-herculanum text-[16px]">
                    <span>
                      {isRefetching ? (
                        "..."
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{
                            __html: getCurrentPrice(),
                          }}
                        />
                      )}
                    </span>
                    <HypeLogo className="w-[9px] h-[7px]" />
                    <span>/ HYDRO</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    whileHover={{ scale: 0.95 }}
                    whileTap={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 600, damping: 20 }}
                    className="w-full"
                  >
                    <Button
                      onClick={() => handleMint()}
                      variant="default"
                      className="relative overflow-hidden group p-5 w-[300px] h-[90px] rounded-[90px] text-[16px]"
                      disabled={
                        mintProgress === "loading" ||
                        isRefetching ||
                        (userInfos?.whitelistMinted >=
                          saleInfo?.whitelistSaleConfig.maxPerWallet &&
                          saleInfo?.currentPhase === PHASE_WHITELIST)
                      }
                    >
                      <span className="z-10 flex items-center gap-2">
                        {mintProgress === "loading"
                          ? "MINTING..."
                          : `MINT ${mintAmount} HYDROS`}
                      </span>
                      <div className="group-hover:scale-100 opacity-40 transition-transform duration-500 absolute transform scale-0 bg-white min-h-full min-w-full aspect-square rounded-full inset-0 m-auto"></div>
                    </Button>
                  </motion.div>
                  <span className="text-sm text-teal-50 font-herculanum">
                    {isConnected
                      ? `MAX ${getMaxMintAmount()} PER WALLET`
                      : "CONNECT WALLET TO MINT"}
                  </span>
                </div>
              </motion.div>
            </div>
            <PriceTable />
          </motion.div>

          {/* Right Column - Circle Timer */}
          <div className="order-1 lg:order-2 flex flex-col justify-center h-full">
            {" "}
            {/* First on mobile, second on desktop */}
            <Timer
              refetch={() => {
                refetch();
                queryClient.invalidateQueries({
                  queryKey: ["saleInfoTestnet"],
                });
              }}
              getNftLeftPercentage={getNftLeftPercentage}
              saleInfo={saleInfo}
            />
            <div className="pt-[3vh]">
              <LiveView />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type TimerProps = {
  getNftLeftPercentage: () => number;
  saleInfo?: ExtendedSalesInfo;
  refetch: () => void;
};

function Timer({ getNftLeftPercentage, saleInfo, refetch }: TimerProps) {
  const [timeUntilPriceUpdate, setTimeUntilPriceUpdate] = useState<number>(60);
  const [whitelistTimePercentage, setWhitelistTimePercentage] =
    useState<number>(100);
  const [nextUpdateTimestamp, setNextUpdateTimestamp] = useState<number | null>(
    null
  );
  const isWhitelistPhase = saleInfo?.currentPhase === PHASE_WHITELIST;
  const isAuctionPhase = saleInfo?.currentPhase === PHASE_AUCTION;
  const isFinishedPhase = saleInfo?.currentPhase === PHASE_FINISHED;
  const isInactivePhase = saleInfo?.currentPhase === PHASE_INACTIVE;

  // Calculate the next price update timestamp based on contract logic
  useEffect(() => {
    if (!isAuctionPhase && !isWhitelistPhase) {
      setNextUpdateTimestamp(null);
      return;
    }

    if (
      !isWhitelistPhase &&
      saleInfo?.auctionSaleConfig.startTime &&
      saleInfo?.priceUpdateInterval
    ) {
      const now = Math.floor(Date.now() / 1000);
      const auctionStartTime = Number(saleInfo.auctionSaleConfig.startTime);
      const interval = Number(saleInfo.priceUpdateInterval);

      // Calculate time since auction started
      const timeSinceStart = now - auctionStartTime;

      // Calculate how many full intervals have passed
      const intervalsElapsed = Math.floor(timeSinceStart / interval);

      // Calculate when the next interval will occur
      const nextIntervalTime =
        auctionStartTime + (intervalsElapsed + 1) * interval;

      // Store this timestamp
      setNextUpdateTimestamp(nextIntervalTime);

      // Calculate how many seconds until the next update
      const timeUntilNextUpdate = Math.max(0, nextIntervalTime - now);
      setTimeUntilPriceUpdate(timeUntilNextUpdate);

      console.log(
        `Next price update in ${timeUntilNextUpdate} seconds at timestamp ${nextIntervalTime}`
      );
    }
  }, [
    saleInfo?.auctionSaleConfig.startTime,
    saleInfo?.priceUpdateInterval,
    isWhitelistPhase,
    isAuctionPhase,
  ]);

  // Calculate the percentage of time remaining for whitelist phase
  useEffect(() => {
    if (isWhitelistPhase && saleInfo?.auctionSaleConfig.startTime) {
      const now = Math.floor(Date.now() / 1000);
      const startTimeSeconds = Number(saleInfo.auctionSaleConfig.startTime);

      // Get the original duration (from whitelist start to auction start)
      const whitelistStartTime = Number(saleInfo.whitelistSaleConfig.startTime);
      const totalDuration = startTimeSeconds - whitelistStartTime;

      // Calculate remaining time
      const remainingTime = Math.max(0, startTimeSeconds - now);

      // Calculate percentage - make sure totalDuration is not 0 to avoid division by zero
      if (totalDuration > 0) {
        const percentage = (remainingTime / totalDuration) * 100;
        setWhitelistTimePercentage(percentage);
      } else {
        setWhitelistTimePercentage(0);
      }

      // Update every second
      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remainingTime = Math.max(0, startTimeSeconds - now);

        if (totalDuration > 0) {
          const percentage = (remainingTime / totalDuration) * 100;
          setWhitelistTimePercentage(percentage);
        } else {
          setWhitelistTimePercentage(0);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [
    isWhitelistPhase,
    saleInfo?.auctionSaleConfig.startTime,
    saleInfo?.whitelistSaleConfig.startTime,
  ]);

  // Calculate the percentage of time remaining for the timer
  const calculateTimePercentage = () => {
    if (isWhitelistPhase) {
      // For whitelist phase, return the calculated percentage based on time remaining
      return whitelistTimePercentage;
    } else if (nextUpdateTimestamp && saleInfo?.priceUpdateInterval) {
      // For auction phase, calculate percentage based on time until next update
      const now = Math.floor(Date.now() / 1000);
      const totalInterval = Number(saleInfo.priceUpdateInterval);
      const elapsed =
        totalInterval - Math.min(totalInterval, nextUpdateTimestamp - now);
      return Math.max(0, 100 - (elapsed / totalInterval) * 100);
    } else {
      return 100; // Default if we don't have data yet
    }
  };

  // Countdown timer for auction phase
  useEffect(() => {
    if (
      isWhitelistPhase ||
      isFinishedPhase ||
      isInactivePhase ||
      !nextUpdateTimestamp
    )
      return;

    // Create a timer that updates every second
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);

      // Calculate seconds until next price update
      const remainingTime = Math.max(0, nextUpdateTimestamp - now);
      setTimeUntilPriceUpdate(remainingTime);

      // If it's time for an update, refetch the data
      if (remainingTime <= 1) {
        console.log("Time for price update - fetching new price data");

        // Small delay to ensure the contract has updated
        setTimeout(() => {
          refetch();
        }, 2000);

        // Calculate the next update timestamp
        if (saleInfo?.priceUpdateInterval) {
          const nextTimestamp =
            nextUpdateTimestamp + Number(saleInfo.priceUpdateInterval);
          setNextUpdateTimestamp(nextTimestamp);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    nextUpdateTimestamp,
    isWhitelistPhase,
    refetch,
    saleInfo?.priceUpdateInterval,
    isFinishedPhase,
    isInactivePhase,
  ]);

  const perspectiveEl = useRef(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const targetX = useRef(0);
  const targetY = useRef(0);
  const animatedX = useRef(0);
  const animatedY = useRef(0);
  const rafId = useRef(0);

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  useEffect(() => {
    if (!perspectiveEl.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = perspectiveEl.current!.getBoundingClientRect();
      targetX.current = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      targetY.current = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    };

    const handleMouseLeave = () => {
      targetX.current = 0;
      targetY.current = 0;
    };

    const element = perspectiveEl.current;
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      animatedX.current = lerp(animatedX.current, targetX.current, 0.2);
      animatedY.current = lerp(animatedY.current, targetY.current, 0.2);
      setMouseX(animatedX.current);
      setMouseY(animatedY.current);
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className="text-center relative overflow-visible w-full max-w-[550px] lg:max-h-full max-h-[35vh] mx-auto md:mt-0 mt-[6vh]">
      {/* Pre-launch circle as absolutely positioned element with background image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.8 }}
        className="absolute animate-rotate w-full transform scale-125 aspect-square max-h-full pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage: "url('/images/pre-launch-circle.png')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-col items-center justify-start  max-h-full"
        ref={perspectiveEl}
      >
        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 350, damping: 15 }}
          className="w-full h-full flex flex-col items-center justify-start"
          style={{ perspective: "500px", transformStyle: "preserve-3d" }}
        >
          <motion.div
            className="group relative lg:w-[80%] w-auto aspect-square lg:h-auto h-[35vh] flex justify-center items-center"
            animate={{
              rotateX: mouseY,
              rotateY: -mouseX,
            }}
            transition={{ type: "tween", duration: 0, ease: "easeOut" }}
          >
            <div className="animate-bg group-hover:opacity-[0.05] mix-blend-overlay opacity-0 transition-opacity duration-500 absolute w-[86%] h-[86%] rounded-full"></div>

            {/* Outer Circle - Timer Progress */}
            <CircularProgress
              value={calculateTimePercentage()}
              size={290}
              thickness={2}
              color="rgba(152, 252, 228, 1)"
              trackColor="rgba(152, 252, 228, 0.1)"
              className="absolute w-full sm:hidden"
            />

            <CircularProgress
              value={calculateTimePercentage()}
              size={350}
              thickness={2.5}
              color="rgba(152, 252, 228, 1)"
              trackColor="rgba(152, 252, 228, 0.1)"
              className="absolute w-full hidden sm:block md:hidden"
            />

            <CircularProgress
              value={calculateTimePercentage()}
              size={400}
              thickness={3}
              color="rgba(152, 252, 228, 1)"
              trackColor="rgba(152, 252, 228, 0.1)"
              className="absolute w-full hidden md:block lg:hidden"
            />

            <CircularProgress
              value={calculateTimePercentage()}
              size={450}
              thickness={3}
              color="rgba(152, 252, 228, 1)"
              trackColor="rgba(152, 252, 228, 0.1)"
              className="absolute w-full hidden lg:block"
            />

            {/* Inner Circle - Supply Progress */}
            <CircularProgress
              value={getNftLeftPercentage()}
              size={260}
              thickness={4}
              color="rgba(240, 253, 250, 1)"
              trackColor="rgba(240, 253, 250, 0.1)"
              className="absolute w-[90%] sm:hidden"
            />
            <CircularProgress
              value={getNftLeftPercentage()}
              size={310}
              thickness={5}
              color="rgba(240, 253, 250, 1)"
              trackColor="rgba(240, 253, 250, 0.1)"
              className="absolute w-[90%] hidden sm:block md:hidden"
            />
            <CircularProgress
              value={getNftLeftPercentage()}
              size={360}
              thickness={5}
              color="rgba(240, 253, 250, 1)"
              trackColor="rgba(240, 253, 250, 0.1)"
              className="absolute w-[90%] hidden md:block lg:hidden"
            />
            <CircularProgress
              value={getNftLeftPercentage()}
              size={410}
              thickness={6}
              color="rgba(240, 253, 250, 1)"
              trackColor="rgba(240, 253, 250, 0.1)"
              className="absolute w-[90%] hidden lg:block"
            />

            {/* Center Text */}
            <div className="absolute inset-0 lg:pt-10 pt-4 px-4 flex flex-col items-center justify-center text-center z-10">
              {isInactivePhase ? (
                <>
                  <h3 className="font-herculanum text-white mb-0.5 sm:mb-1">
                    INACTIVE
                  </h3>
                </>
              ) : undefined}

              {isAuctionPhase ? (
                <>
                  <h3 className="font-herculanum text-white mb-0.5 sm:mb-1">
                    NEXT PRICE IN
                  </h3>
                  <p className="text-primary font-herculanum text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">
                    {timeUntilPriceUpdate}
                    <span className="text-base sm:text-md">s</span>
                  </p>
                </>
              ) : undefined}

              {isWhitelistPhase ? (
                <>
                  <h3 className="font-herculanum text-white text-lg sm:text-xl mb-0.5 sm:mb-1">
                    PUBLIC SALE STARTS IN
                  </h3>
                  <TimeRemaining
                    startTime={saleInfo?.auctionSaleConfig.startTime}
                  />
                </>
              ) : undefined}

              {isFinishedPhase || isInactivePhase ? (
                <>
                  <h3 className="font-herculanum text-white text-lg sm:text-xl mb-0.5 sm:mb-1">
                    RESERVE PRICE REACHED
                  </h3>
                </>
              ) : undefined}

              <div className="w-24 sm:w-32 h-px bg-primary/30 my-2 sm:my-3"></div>

              <p className="font-herculanum text-white text-base sm:text-lg mb-0.5 sm:mb-1">
                SUPPLY
              </p>

              <p className="text-primary text-xl sm:text-2xl font-herculanum">
                {!saleInfo
                  ? "Loading..."
                  : `${saleInfo?.maxSupply - saleInfo?.totalSupply}`}
              </p>
              {saleInfo?.currentPhase === PHASE_AUCTION ? (
                <div className="flex flex-col items-center justify-center !pt-5">
                  <span className="font-herculanum text-white mb-0.5 sm:mb-1">
                    ENDS IN
                  </span>
                  <TimeRemaining startTime={saleInfo?.auctionEndTime} small />
                </div>
              ) : undefined}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
