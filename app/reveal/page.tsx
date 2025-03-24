"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useWaitForTransactionReceipt } from "wagmi";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Counter } from "@/components/Counter";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/lib/hooks/useReveal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSaleInfoTestnet } from "@/lib/hooks/useSaleInfoTestnet";
import { NFTMetadata } from "@/lib/types";

export default function RevealPage() {
  const [revealAmount, setRevealAmount] = useState(1);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [tokenIds, setTokenIds] = useState<number[]>([]);
  const [revealedNFTs, setRevealedNFTs] = useState<NFTMetadata[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revealedTokenIds, setRevealedTokenIds] = useState<number[]>([]);
  const [currentNFT, setCurrentNFT] = useState<NFTMetadata | null>(null);

  // Get the reveal hook
  const { executeReveal, isLoading, getTokenURI, isTokenRevealed } =
    useReveal();

  const { data: saleInfo, refetch: refetchSaleInfo } = useSaleInfoTestnet();
  const isRevealEnabled = saleInfo?.revealEnabled;

  // Function to fetch metadata for the revealed NFTs
  const fetchRevealedNFTMetadata = useCallback(
    async (tokenIds: number[]) => {
      try {
        setRevealedNFTs([]);
        setCurrentNFT(null);
        // Fetch metadata from the contract for each token ID
        const fetchedNFTs = await Promise.all(
          tokenIds.map(async (id) => {
            try {
              // Get the token URI from the contract
              const tokenURI = await getTokenURI(id);

              // Convert IPFS URI to HTTP URL for fetching if needed
              let httpURI = tokenURI;
              if (tokenURI.startsWith("ipfs://")) {
                httpURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
              }

              // Fetch the metadata
              const response = await fetch(httpURI);

              if (!response.ok) {
                throw new Error(
                  `Failed to fetch metadata for token ${id}: ${response.statusText}`
                );
              }

              const metadata = await response.json();

              // Convert IPFS image URL to HTTP URL if needed
              let imageUrl = metadata.image;
              if (imageUrl && imageUrl.startsWith("ipfs://")) {
                imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
              }

              return {
                id,
                name: metadata.name || `Hydro #${id}`,
                image: imageUrl,
                attributes: metadata.attributes || [],
              };
            } catch (error) {
              console.error(`Error fetching metadata for token ${id}:`, error);

              // Fallback to mock data if fetching fails
              return {
                id,
                name: `Hydro #${id}`,
                image: `/images/artefact_hand.png`, // Placeholder image
                attributes: [
                  { trait_type: "Background", value: "Ocean Blue" },
                  { trait_type: "Rarity", value: "Legendary" },
                  { trait_type: "Type", value: "Citizen" },
                  { trait_type: "Element", value: "Water" },
                ],
              };
            }
          })
        );

        setRevealedNFTs(fetchedNFTs);
      } catch (error) {
        console.error("Error fetching NFT metadata:", error);
      }
    },
    [getTokenURI]
  ); // Only recreate when getTokenURI changes

  // Use the hook at component level to wait for transaction
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Effect to handle successful transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      setIsSuccess(true);

      // Fetch metadata for the revealed NFTs
      fetchRevealedNFTMetadata(revealedTokenIds);
      refetchSaleInfo();
      // Open the dialog to show the revealed NFTs
      setDialogOpen(true);

      setTimeout(() => setIsSuccess(false), 3000);
      setIsRevealing(false);

      // Only log when the condition is met
      console.log("Transaction confirmed, revealing NFTs");

      // Reset txHash to prevent infinite loop
      setTxHash(undefined);
    }
  }, [
    isConfirmed,
    txHash,
    revealedTokenIds,
    fetchRevealedNFTMetadata,
    refetchSaleInfo,
  ]);

  // Set the current NFT when revealed NFTs are updated
  useEffect(() => {
    if (revealedNFTs.length > 0 && !currentNFT) {
      console.log("Setting initial NFT:", revealedNFTs[0]);
      setCurrentNFT(revealedNFTs[0]);
    }
  }, [revealedNFTs, currentNFT]);

  // Add keyboard navigation for the carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialogOpen) return;

      if (e.key === "ArrowRight" && canNavigateNext()) {
        navigateToNext();
      } else if (e.key === "ArrowLeft" && canNavigatePrev()) {
        navigateToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogOpen, currentNFT, revealedNFTs]);

  // Navigation functions
  const navigateToNext = () => {
    if (!currentNFT || revealedNFTs.length <= 1) return;

    const currentIndex = revealedNFTs.findIndex(
      (nft) => nft.id === currentNFT.id
    );
    const nextIndex = (currentIndex + 1) % revealedNFTs.length;
    setCurrentNFT(revealedNFTs[nextIndex]);
  };

  const navigateToPrev = () => {
    if (!currentNFT || revealedNFTs.length <= 1) return;

    const currentIndex = revealedNFTs.findIndex(
      (nft) => nft.id === currentNFT.id
    );
    const prevIndex =
      (currentIndex - 1 + revealedNFTs.length) % revealedNFTs.length;
    setCurrentNFT(revealedNFTs[prevIndex]);
  };

  // Check if navigation is possible
  const canNavigateNext = () => {
    if (!currentNFT || revealedNFTs.length <= 1) return false;

    const currentIndex = revealedNFTs.findIndex(
      (nft) => nft.id === currentNFT.id
    );
    return currentIndex < revealedNFTs.length - 1;
  };

  const canNavigatePrev = () => {
    if (!currentNFT || revealedNFTs.length <= 1) return false;

    const currentIndex = revealedNFTs.findIndex(
      (nft) => nft.id === currentNFT.id
    );
    return currentIndex > 0;
  };

  // Effect to load unrevealed tokens when component mounts or saleInfo changes
  useEffect(() => {
    if (saleInfo?.unrevealedTokens) {
      // Convert bigint array to number array
      const tokens = saleInfo.unrevealedTokens.map((id) => Number(id));
      setTokenIds(tokens);
    }
  }, [saleInfo]);

  const handleIncrement = () => {
    if (revealAmount < getMaxRevealAmount()) {
      setRevealAmount(revealAmount + 1);
    }
  };

  const handleDecrement = () => {
    if (revealAmount > 1) {
      setRevealAmount(revealAmount - 1);
    }
  };

  const getMaxRevealAmount = () => {
    // Return the number of unrevealed tokens the user has
    return tokenIds.length;
  };

  // Function to filter out already revealed tokens
  const verifyUnrevealedTokens = async (tokenIds: number[]) => {
    try {
      const verifiedUnrevealed = await Promise.all(
        tokenIds.map(async (id) => {
          const revealed = await isTokenRevealed(id);
          return { id, isRevealed: revealed };
        })
      );

      // Filter to only keep unrevealed tokens
      const unrevealed = verifiedUnrevealed
        .filter((token) => !token.isRevealed)
        .map((token) => token.id);

      if (unrevealed.length < tokenIds.length) {
        console.log(
          `Filtered out ${
            tokenIds.length - unrevealed.length
          } already revealed tokens`
        );
      }

      return unrevealed;
    } catch (error) {
      console.error("Error verifying unrevealed tokens:", error);
      return tokenIds; // Return original list on error
    }
  };

  const handleReveal = async () => {
    if (revealAmount <= 0) return;

    try {
      setIsRevealing(true);

      // Select the first N tokens to reveal based on revealAmount
      const tokensToCheck = tokenIds.slice(0, revealAmount);

      // Verify these tokens are actually unrevealed
      const verifiedTokens = await verifyUnrevealedTokens(tokensToCheck);

      if (verifiedTokens.length === 0) {
        setIsRevealing(false);
        alert(
          "No unrevealed tokens found. They may have been revealed already."
        );
        return;
      }

      // Save the verified token IDs being revealed for metadata fetching
      setRevealedTokenIds(verifiedTokens);

      // Execute the reveal transaction with verified unrevealed tokens and salts
      await executeReveal({
        tokenIds: verifiedTokens,
        onSuccess: (hash) => {
          // Set the transaction hash for monitoring confirmation
          setTxHash(hash);
        },
        onError: (err) => {
          console.error("Reveal error:", err);
          setIsRevealing(false);
        },
      });

      // Update the token IDs list by removing revealed ones
      setTokenIds((prev) => prev.filter((id) => !verifiedTokens.includes(id)));
    } catch (error) {
      console.error("Reveal error:", error);
      setIsRevealing(false);
    }
  };

  return (
    <>
      <div className="w-full mx-auto px-4 flex flex-col pt-30 relative">
        <div className="flex flex-col w-full">
          {/* Main content grid - two columns on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 w-full items-start">
            {/* Left Column - Artifact Image - On mobile this goes second */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center relative order-2 lg:order-1 h-[794px]"
            >
              <div className="relative w-full flex items-end justify-center">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10 w-full h-full">
                  {/* <Image
                    src="/images/artefact_hand.png"
                    alt="Hydros Artifact"
                    width={1000}
                    height={794}
                    priority
                    className="object-contain absolute -inset-6 left-1/2 transform -translate-x-1/2 w-[120%] max-w-[1000px] h-auto scale-125 sm:scale-110 md:scale-125 lg:scale-150"
                  /> */}

                  {/* Glowing orb overlay */}
                  {/* <div className="absolute top-[33%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full bg-teal-400/20 blur-xl animate-pulse"></div>
                  <div className="absolute top-[33%] left-1/2 -translate-x-1/2 w-[160px] h-[160px] rounded-full bg-teal-300/30 blur-lg animate-pulse"></div>
                  <div className="absolute top-[33%] left-1/2 -translate-x-1/2 w-[120px] h-[120px] rounded-full bg-teal-200/40 blur-md animate-pulse"></div> */}
                </div>
              </div>
            </motion.div>

            {/* Right Column - Counter and Reveal Button - On mobile this goes first */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center pt-8 lg:pt-24 order-1 lg:order-2"
            >
              <div className="flex flex-col items-center justify-center gap-5">
                <div className="flex flex-col items-center justify-center gap-2">
                  <h1 className="hydros-title text-center">
                    REVEAL YOUR HYDROS
                  </h1>
                  <p className="text-center text-teal-50 font-herculanum text-sm sm:text-base uppercase tracking-widest">
                    USE THE POWER OF THE AQUALIUM TO REVEAL YOUR HYDROS
                  </p>
                </div>
                <div className="mb-4">
                  <Counter
                    amount={revealAmount}
                    handleIncrement={handleIncrement}
                    handleDecrement={handleDecrement}
                    getMaxAmount={getMaxRevealAmount}
                    disabled={!isRevealEnabled}
                  />
                </div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-full max-w-[300px]"
                >
                  <Button
                    onClick={handleReveal}
                    disabled={
                      !isRevealEnabled ||
                      isRevealing ||
                      isLoading ||
                      getMaxRevealAmount() === 0
                    }
                    className=" hover:translate-y-[-1px] hover:shadow-md p-5 w-[300px] h-[90px] rounded-[90px] text-[16px]"
                  >
                    {!isRevealEnabled
                      ? "Reveal not enabled"
                      : isRevealing
                      ? "Revealing..."
                      : `Reveal ${revealAmount} Hydros`}
                  </Button>
                </motion.div>

                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-teal-300 font-herculanum text-xl mt-4"
                  >
                    Successfully revealed {revealAmount} Hydros!
                  </motion.div>
                )}

                {getMaxRevealAmount() === 0 && !isSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-teal-300/70 font-herculanum text-lg mt-4"
                  >
                    You have no unrevealed Hydros
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* NFT Reveal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          title="reveal hydros"
          className="backdrop-blur-md !border-none !bg-transparent justify-center max-w-[95vw] mx-auto sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[1100px] p-3 sm:p-4 md:p-6"
        >
          <div className="flex flex-col h-full w-full justify-center">
            <div className="flex-1 flex items-center justify-center">
              {/* Carousel implementation */}
              {revealedNFTs.length > 0 && (
                <div className="relative w-full flex flex-col gap-4">
                  {/* Carousel Component */}
                  <div className="flex flex-col md:flex-row items-center justify-center w-full gap-4  ">
                    {/* Main Content Container - for mobile view */}
                    <Button
                      onClick={navigateToPrev}
                      disabled={!canNavigatePrev()}
                      className={`flex-shrink-0 w-13 h-10 rounded-full flex items-center justify-center order-1 
                        ${
                          canNavigatePrev()
                            ? "bg-[#98FCE433] hover:bg-[#98FCE433]/30 text-teal-50"
                            : "bg-gray-800/30 text-gray-400 cursor-not-allowed"
                        }`}
                      aria-label="Previous NFT"
                    >
                      <ArrowLeft className="w-6 h-6" />
                    </Button>

                    <div className="flex flex-col md:flex-row items-center w-full space-x-10 order-2  ">
                      {/* NFT Image - Left Side (Top on mobile) */}
                      <div className="shadow-[0_0_100px_rgba(45,212,191,0.7)] w-full max-w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] md:w-[350px] md:h-[350px] lg:w-[480px] lg:h-[480px] relative bg-gray-800/40 rounded-lg overflow-hidden order-1">
                        {currentNFT && (
                          <Image
                            src={currentNFT.image}
                            alt={currentNFT.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* NFT Details - Right Side (Bottom on mobile) */}
                      <div className="w-full max-w-[350px] h-[350px] sm:w-[400px] sm:h-[400px] md:w-[350px] md:h-[350px] lg:w-[480px] lg:h-[480px] bg-[#FAFAFA0D] rounded-lg p-4 md:p-6 lg:p-8 flex flex-col mt-6 md:mt-0 order-2">
                        {currentNFT && (
                          <div className="flex flex-col text-center">
                            <div className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">
                              HYDROS #{currentNFT.id}
                            </div>
                            <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-herculanum mb-2 sm:mb-4 md:mb-6">
                              {currentNFT.name}
                            </h2>

                            {/* Rarity Badge */}
                            {currentNFT.attributes.find(
                              (attr) =>
                                attr.trait_type.toLowerCase() === "rarity"
                            ) && (
                              <div className="mb-2 sm:mb-4 md:mb-6">
                                <span className="inline-block px-2 py-1 sm:px-3 md:px-4 md:py-1 rounded-full bg-pink-600 text-white text-xs md:text-sm font-medium uppercase">
                                  {
                                    currentNFT.attributes.find(
                                      (attr) =>
                                        attr.trait_type.toLowerCase() ===
                                        "rarity"
                                    )?.value
                                  }
                                </span>
                              </div>
                            )}

                            {/* Attributes List */}
                            <div className="flex-1 overflow-auto">
                              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                                {currentNFT.attributes.map((attr, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between"
                                  >
                                    <span className="text-gray-400 uppercase font-herculanum  md:text-base">
                                      {attr.trait_type}
                                    </span>
                                    <span className="text-teal-400 uppercase font-herculanum  md:text-base">
                                      {attr.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={navigateToNext}
                      disabled={!canNavigateNext()}
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center order-3 
                        ${
                          canNavigateNext()
                            ? "bg-[#98FCE433] hover:bg-[#98FCE433]/30 text-teal-50"
                            : "bg-gray-800/30 text-gray-400 cursor-not-allowed"
                        }`}
                      aria-label="Next NFT"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </Button>
                  </div>

                  {/* Pagination Dots */}
                  <div className="flex justify-center gap-2 mt-4">
                    {revealedNFTs.map((nft, index) => (
                      <span
                        key={nft.id}
                        onClick={() => setCurrentNFT(revealedNFTs[index])}
                        className={`w-2 h-2 rounded-full ${
                          currentNFT?.id === nft.id
                            ? "bg-primary"
                            : "bg-primary/20"
                        }`}
                        aria-label={`Go to NFT ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* <div className="flex justify-center mt-4 md:mt-6">
              <Button
                onClick={() => setDialogOpen(false)}
                className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-50 border border-teal-500/50 rounded-full px-6 py-2 md:px-8 md:py-2 font-herculanum text-sm md:text-base"
              >
                CLOSE
              </Button>
            </div> */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
