"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatUnits } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PriceTable } from "@/components/PriceTable";
import { PHASE_AUCTION, PHASE_WHITELIST } from "@/lib/abi/types";
import {
  ExtendedSalesInfo,
  useSaleInfoTestnet,
} from "@/lib/hooks/useSaleInfoTestnet";
import { useMint } from "@/lib/hooks/useMint";
import { Button } from "@/components/ui/button";
import { HypeLogo } from "@/lib/utils/utils";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Counter } from "@/components/Counter";
import AuctionNotStarted from "@/components/AuctionNotStarted";
import { useUserInfos } from "@/lib/hooks/useUserInfos";
import TimeRemaining from "@/components/TimeRemaining";
import LiveView from "@/components/LiveView";

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
    else if (saleInfo.currentPhase === PHASE_AUCTION) {
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

    return 1; // Default to 1 for unknown phases
  };

  const getCurrentPrice = () => {
    if (!saleInfo) return "0";

    let unitPrice: bigint;

    // Get the current unit price based on the sale phase
    if (saleInfo.currentPhase === PHASE_WHITELIST) {
      unitPrice = saleInfo.whitelistSaleConfig.price;
    } else if (saleInfo.currentPhase === PHASE_AUCTION) {
      unitPrice = saleInfo.currentPrice || saleInfo.auctionSaleConfig.price;
    } else {
      return "0";
    }

    return parseFloat(formatUnits(unitPrice, 18)).toFixed(5);
  };

  const getTotalPrice = () => {
    if (!saleInfo) return "0";

    let unitPrice: bigint;

    // Get the current unit price based on the sale phase
    if (saleInfo.currentPhase === PHASE_WHITELIST) {
      unitPrice = saleInfo.whitelistSaleConfig.price;
    } else if (saleInfo.currentPhase === PHASE_AUCTION) {
      unitPrice = saleInfo.currentPrice || saleInfo.auctionSaleConfig.price;
    } else {
      return "0";
    }

    const totalPrice = unitPrice * BigInt(mintAmount);
    return parseFloat(formatUnits(totalPrice, 18)).toFixed(5);
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
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col pt-20 relative pb-5">
      {/* Tables and Countdown */}

      <div className="flex flex-col w-full">
        {/* Main content grid - reordered columns on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-2 lg:order-1" // Second on mobile, first on desktop
          >
            <div className="flex flex-col items-center justify-center sm:pt-4 ">
              <span className="text-teal-50 font-herculanum text-sm sm:text-base uppercase tracking-widest mb-2">
                {getPhaseTitle()}
              </span>
              <h1 className="hydros-title !text-3xl mb-8 text-center">
                CITIZEN OF HYDROPOLIS
              </h1>
              <motion.div
                className="flex flex-col items-center mb-8 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Counter
                  amount={mintAmount}
                  handleIncrement={handleIncrement}
                  handleDecrement={handleDecrement}
                  getMaxAmount={getMaxMintAmount}
                />

                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-teal-50 font-herculanum text-[33px]">
                      {isRefetching ? (
                        <motion.span
                          className="text-teal-50 font-herculanum text-[33px]"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "easeInOut",
                          }}
                        >
                          Fetching new price...
                        </motion.span>
                      ) : (
                        getTotalPrice()
                      )}
                    </span>{" "}
                    <HypeLogo className="w-[13px] h-[10px]" />
                  </div>
                  <div className="flex items-center gap-2 font-herculanum text-[16px]">
                    <span>{isRefetching ? "..." : getCurrentPrice()}</span>
                    <HypeLogo className="w-[9px] h-[7px]" />
                    <span>/ HYDRO</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Button
                    onClick={() => handleMint()}
                    variant="default"
                    className=" hover:translate-y-[-1px] hover:shadow-md p-5 w-[300px] h-[90px] rounded-[90px] text-[16px]"
                    disabled={
                      mintProgress === "loading" ||
                      isRefetching ||
                      (userInfos?.whitelistMinted >=
                        saleInfo?.whitelistSaleConfig.maxPerWallet &&
                        saleInfo?.currentPhase === PHASE_WHITELIST)
                    }
                  >
                    {mintProgress === "loading"
                      ? "MINTING..."
                      : `MINT ${mintAmount} HYDROS`}
                  </Button>
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
          <div className="order-1 lg:order-2">
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
            <div className="pt-20">
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
  const isWhitelistPhase = saleInfo?.currentPhase === PHASE_WHITELIST;

  // For auction phase, we show the price update interval countdown
  useEffect(() => {
    if (!isWhitelistPhase && saleInfo?.priceUpdateInterval) {
      // Set the initial value
      setTimeUntilPriceUpdate(Number(saleInfo.priceUpdateInterval));
    }
  }, [saleInfo?.priceUpdateInterval, isWhitelistPhase]);

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
    } else {
      // For auction phase, show percentage of time remaining until next price update
      return (
        (timeUntilPriceUpdate / Number(saleInfo?.priceUpdateInterval || 60)) *
        100
      );
    }
  };

  // Only start the countdown timer if we're in the auction phase
  useEffect(() => {
    if (isWhitelistPhase) return; // Don't run the timer during whitelist phase

    // Create an interval for the countdown
    const interval = setInterval(() => {
      setTimeUntilPriceUpdate((prev) => {
        // When we reach 0, reset to priceUpdateInterval and fetch new price
        if (prev <= 1) {
          console.log("Timer complete - refetching price data");
          // Trigger refetch to get updated price
          refetch();
          // Reset to the price update interval
          return Number(saleInfo?.priceUpdateInterval || 60);
        }
        // Otherwise just count down
        return prev - 1;
      });
    }, 1000);

    // Clear interval on component unmount or phase change
    return () => clearInterval(interval);
  }, [refetch, saleInfo?.priceUpdateInterval, isWhitelistPhase]);

  return (
    <div className="text-center relative overflow-visible">
      {/* Pre-launch circle as absolutely positioned element with background image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 0.8 }}
        className="absolute w-[400px] h-[400px] md:w-[450px] md:h-[450px] lg:w-[648px] lg:h-[648px] left-1/2 top-[153px] lg:top-[253px] sm:-bottom-[350px] md:-bottom-[400px] lg:-bottom-[460px] -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-multiply"
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
        className="flex flex-col items-center justify-start"
      >
        <div className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] md:w-[350px] md:h-[350px] lg:w-[400px] lg:h-[400px] mt-6 md:mt-10">
          {/* Outer Circle - Timer Progress */}
          <CircularProgress
            value={calculateTimePercentage()}
            size={290}
            thickness={2}
            color="rgba(152, 252, 228, 1)"
            trackColor="rgba(152, 252, 228, 0.1)"
            className="absolute -inset-6 sm:hidden"
          />

          <CircularProgress
            value={calculateTimePercentage()}
            size={350}
            thickness={2.5}
            color="rgba(152, 252, 228, 1)"
            trackColor="rgba(152, 252, 228, 0.1)"
            className="absolute -inset-6 hidden sm:block md:hidden"
          />

          <CircularProgress
            value={calculateTimePercentage()}
            size={400}
            thickness={3}
            color="rgba(152, 252, 228, 1)"
            trackColor="rgba(152, 252, 228, 0.1)"
            className="absolute -inset-6 hidden md:block lg:hidden"
          />

          <CircularProgress
            value={calculateTimePercentage()}
            size={450}
            thickness={3}
            color="rgba(152, 252, 228, 1)"
            trackColor="rgba(152, 252, 228, 0.1)"
            className="absolute -inset-6 hidden lg:block"
          />

          {/* Inner Circle - Supply Progress */}
          <CircularProgress
            value={getNftLeftPercentage()}
            size={260}
            thickness={4}
            color="rgba(240, 253, 250, 1)"
            trackColor="rgba(240, 253, 250, 0.1)"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:hidden"
          />
          <CircularProgress
            value={getNftLeftPercentage()}
            size={310}
            thickness={5}
            color="rgba(240, 253, 250, 1)"
            trackColor="rgba(240, 253, 250, 0.1)"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden sm:block md:hidden"
          />
          <CircularProgress
            value={getNftLeftPercentage()}
            size={360}
            thickness={5}
            color="rgba(240, 253, 250, 1)"
            trackColor="rgba(240, 253, 250, 0.1)"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block lg:hidden"
          />
          <CircularProgress
            value={getNftLeftPercentage()}
            size={410}
            thickness={6}
            color="rgba(240, 253, 250, 1)"
            trackColor="rgba(240, 253, 250, 0.1)"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden lg:block"
          />

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
            {!isWhitelistPhase ? (
              <>
                <h3 className="font-herculanum text-white text-lg sm:text-xl mb-0.5 sm:mb-1">
                  PRICE UPDATE
                </h3>
                <p className="text-primary text-2xl sm:text-3xl font-bold mb-2 sm:mb-3">
                  {timeUntilPriceUpdate}s
                </p>
              </>
            ) : (
              <>
                <h3 className="font-herculanum text-white text-lg sm:text-xl mb-0.5 sm:mb-1">
                  PUBLIC SALE STARTS IN
                </h3>
                <TimeRemaining
                  startTime={saleInfo.auctionSaleConfig.startTime}
                />
              </>
            )}

            <div className="w-24 sm:w-32 h-px bg-primary/30 my-2 sm:my-3"></div>

            <p className="font-herculanum text-white text-base sm:text-lg mb-0.5 sm:mb-1">
              SUPPLY
            </p>
            <p className="text-primary text-xl sm:text-2xl">
              {!saleInfo
                ? "Loading..."
                : `${saleInfo?.maxSupply - saleInfo?.totalSupply}`}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
