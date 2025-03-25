"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";

import { Counter } from "@/components/Counter";
import { Button } from "@/components/ui/button";
import { useReveal } from "@/lib/hooks/useReveal";
import { useSaleInfoTestnet } from "@/lib/hooks/useSaleInfoTestnet";
import { NFTMetadata } from "@/lib/types";
import RevealDialog from "@/components/RevealDialog";
import { mockRevealedNFTs } from "./utils";

export default function RevealPage() {
  const [revealAmount, setRevealAmount] = useState(1);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [tokenIds, setTokenIds] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revealedTokenIds, setRevealedTokenIds] = useState<number[]>([]);

  // TESTING ONLY

  const [currentNFT, setCurrentNFT] = useState<NFTMetadata | null>(
    mockRevealedNFTs[0]
  );
  const [revealedNFTs, setRevealedNFTs] =
    useState<NFTMetadata[]>(mockRevealedNFTs);
  React.useEffect(() => {
    setTimeout(() => {
      setDialogOpen(true);
    }, 2000);
  }, []);

  // END TESTING ONLY

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
    return tokenIds.length < 30 ? tokenIds.length : 30;
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
          toast.success(
            <div className="flex flex-col gap-1">
              <h3 className="font-herculanum">REVEAL SUCCESSFUL!</h3>
              <a
                href={`https://testnet.purrsec.com/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline mt-1 text-primary hover:text-primary/80"
              >
                View transaction
              </a>
            </div>
          );
        },
        onError: (err) => {
          console.error("Reveal error:", err);
          setIsRevealing(false);
          toast.error(
            <div className="flex flex-col gap-1">
              <h3 className="font-herculanum">MINT FAILED</h3>
              <p className="text-sm">
                There was an error during the minting process.
              </p>
            </div>
          );
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
      <RevealDialog
        navigateToPrev={navigateToPrev}
        navigateToNext={navigateToNext}
        canNavigatePrev={canNavigatePrev}
        canNavigateNext={canNavigateNext}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        revealedNFTs={revealedNFTs}
        currentNFT={currentNFT}
        setCurrentNFT={setCurrentNFT}
      />
    </>
  );
}
