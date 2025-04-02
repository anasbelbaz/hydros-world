"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import RevealDialog from "./RevealDialog";
// import { Button } from "@/components/ui/button";

interface NFTMetadata {
  name: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  id?: number;
}

interface NFTCardProps {
  tokenId: number;
  tokenURI?: string;
  imageUrl?: string;
  onPlace?: () => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  tokenId,
  tokenURI,
  // imageUrl,
  // onPlace,
}) => {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(!!tokenURI);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Card rotation state
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle mouse move for rotation effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Calculate mouse position relative to card center (in percentage -50% to 50%)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Convert to rotation angles (limit to ±15 degrees)
    const maxRotation = 10;
    const rotX = (mouseY / (rect.height / 2)) * maxRotation;
    const rotY = (mouseX / (rect.width / 2)) * -maxRotation;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    setIsHovering(true);
    setScale(1.05);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  // Handle click to open dialog
  const handleCardClick = () => {
    if (metadata) {
      setDialogOpen(true);
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenURI) return;

      try {
        setIsLoading(true);
        setError(null);

        // Convert IPFS URI to HTTP URL if needed
        let httpURI = tokenURI;
        if (tokenURI.startsWith("ipfs://")) {
          httpURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        }

        const response = await fetch(httpURI);

        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const data = await response.json();

        // Process the image URL if it's IPFS
        if (data.image && data.image.startsWith("ipfs://")) {
          data.image = data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
        }

        // Add tokenId to metadata for RevealDialog
        setMetadata({
          ...data,
          id: tokenId,
        });
      } catch (err) {
        console.error("Error fetching NFT metadata:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch metadata"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenURI, tokenId]);

  // Determine the image URL to use
  const imageToShow = metadata?.image;

  // Get rarity from metadata attributes
  const getRarity = () => {
    if (!metadata?.attributes) return null;

    const rarityAttr = metadata.attributes.find(
      (attr) => attr.trait_type.toLowerCase() === "rarity"
    );

    return rarityAttr?.value.toUpperCase() || null;
  };

  const rarityStyles: Record<string, string> = {
    common: "bg-[#98FCE4] text-black",
    rare: "bg-[#6CC50C] text-white",
    legendary: "bg-gradient-to-r from-[#FCC400] to-[#CC7C09] text-black",
    mythic: "bg-gradient-to-r from-[#E4205E] to-[#E420AB] text-black",
  };

  const rarityAttribute = getRarity()
  const rarityValue = rarityAttribute ? rarityAttribute.toLowerCase() : "common";
  const rarityClass = rarityStyles[rarityValue] || rarityStyles["common"];

  // Create NFT object for RevealDialog
  const nftForDialog = metadata
    ? {
        id: tokenId,
        name: metadata.name || `HYDROS CITIZEN #${tokenId}`,
        image: metadata.image,
        attributes: metadata.attributes || [],
      }
    : null;

  return (
    <>
      <motion.div
        ref={cardRef}
        className="relative w-full rounded-lg overflow-hidden backdrop-blur-2xl perspective-1000 group cursor-pointer"
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
          transition: isHovering
            ? "transform 0.1s ease"
            : "transform 0.5s ease-out",
          transformStyle: "preserve-3d",
          boxShadow: isHovering
            ? `0 10px 30px -10px rgba(0,0,0,0.5), 
             ${rotateY > 0 ? "-2px" : "2px"} ${
                rotateX > 0 ? "2px" : "-2px"
              } 10px rgba(0,0,0,0.1)`
            : "0 5px 15px -5px rgba(0,0,0,0.35)",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
      >
        {/* Lighting overlay effect */}
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${50 + rotateY}% ${
              50 + rotateX
            }%, rgba(45, 212, 191, 0.15), transparent 60%)`,
            mixBlendMode: "lighten",
          }}
        />

        {/* NFT Image */}
        <div className="relative w-full aspect-square bg-transparent">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
              <p className="text-red-400 text-sm">Error loading image</p>
            </div>
          ) : undefined}

          {imageToShow ? (
            <Image
              src={imageToShow}
              alt={`Hydros Citizen #${tokenId}`}
              fill
              priority
              className="object-cover"
              unoptimized={imageToShow.includes("placeholder.com")}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => {
                // Update state to use placeholder if image fails
                setMetadata((prev) =>
                  prev
                    ? {
                        ...prev,
                        image: `/images/artifact-hand.png`,
                      }
                    : null
                );
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full flex items-center justify-center"
              >
                <div className="w-16 h-16 relative">
                  <motion.div
                    className="absolute inset-0 border-4 border-teal-400/20 border-t-teal-400 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* NFT Details */}
        <div className="p-3 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="text-white/50 text-xs font-herculanum uppercase">
                {metadata?.name || `HYDROS CITIZEN #${tokenId}`}
              </div>
              <div className="text-white font-herculanum text-lg">
                #{tokenId}
              </div>
            </div>
            <div className="flex items-center gap-2 border border-text-gray-300 cursor-pointer hover:bg-teal-500/10 rounded-md p-2">
              <ExternalLink className="w-4 h-4 text-white " />
            </div>
          </div>
          <div className="grid items-center">
            <div className={`text-xs rounded-full px-3 font-herculanum py-1 w-fit ${rarityClass}`}>
              {getRarity() || (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-flex items-center"
                >
                  <span className="w-4 h-1 bg-black rounded-full mx-0.5 animate-pulse"></span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Place Button */}
        {/* <Button
          onClick={onPlace}
          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-herculanum uppercase tracking-wide rounded-b-xl rounded-t-none"
          disabled={isLoading}
        >
          PLACE
        </Button> */}
      </motion.div>

      {/* RevealDialog for the NFT */}
      {nftForDialog && (
        <RevealDialog
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          revealedNFTs={[nftForDialog]}
          currentNFT={nftForDialog}
          setCurrentNFT={() => {}} // No-op function since we only have one NFT
          navigateToPrev={() => {}} // No-op function since we only have one NFT
          navigateToNext={() => {}} // No-op function since we only have one NFT
          canNavigatePrev={() => false} // Always false since we only have one NFT
          canNavigateNext={() => false} // Always false since we only have one NFT
        />
      )}
    </>
  );
};

export default NFTCard;
