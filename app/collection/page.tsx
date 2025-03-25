"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { useReveal } from "@/lib/hooks/useReveal";
import { NFTCard } from "@/components/NFTCard";
import RevealDialog from "@/components/RevealDialog";
import {
  fetchOwnedTokens,
  fetchTokenURIs,
  LoadingPlaceholders,
  ITEMS_PER_PAGE,
} from "./utils";

// Dynamically import motion components with no SSR to avoid hydration issues
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);

// No-SSR wrapper component
const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

// NFT type definition
type NFT = {
  id: number;
  name: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
};

export default function CollectionPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [ownedTokens, setOwnedTokens] = useState<number[]>([]);
  const [displayedTokens, setDisplayedTokens] = useState<number[]>([]);
  const [tokenURIs, setTokenURIs] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { getTokenURI } = useReveal();

  // RevealDialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [revealedNFTs, setRevealedNFTs] = useState<NFT[]>([]);
  const [currentNFT, setCurrentNFT] = useState<NFT | null>(null);

  // Fetch owned tokens when address changes
  useEffect(() => {
    fetchOwnedTokens({
      isConnected,
      address,
      setOwnedTokens,
      setLoading,
      setError,
      setDisplayedTokens,
      setHasMore,
    });
  }, [address, isConnected, publicClient]);

  // Fetch token URIs for displayed tokens
  useEffect(() => {
    fetchTokenURIs({ displayedTokens, tokenURIs, setTokenURIs, getTokenURI });
  }, [displayedTokens, tokenURIs, getTokenURI, setTokenURIs]);

  // Load more tokens when user scrolls to bottom
  const loadMoreTokens = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
    const endIndex = nextPage * ITEMS_PER_PAGE;
    const nextTokens = ownedTokens.slice(startIndex, endIndex);

    // Check if there are more tokens to load
    const hasMoreTokens = endIndex < ownedTokens.length;

    // Update states
    setDisplayedTokens((prev) => [...prev, ...nextTokens]);
    setPage(nextPage);
    setHasMore(hasMoreTokens);
    setLoadingMore(false);
  }, [hasMore, loadingMore, ownedTokens, page]);

  // Initialize intersection observer
  useEffect(() => {
    // Cleanup previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMoreTokens();
        }
      },
      { threshold: 0.1 }
    );

    // Observe the load more element
    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observerRef.current.observe(currentRef);
    }

    // Cleanup function
    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef);
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreTokens]);

  // Function to handle NFT card click
  const handleNFTClick = async (tokenId: number) => {
    try {
      // Get the token URI and metadata
      const uri = tokenURIs[tokenId];
      if (!uri) return;

      // Convert IPFS URI to HTTP URL if needed
      let httpURI = uri;
      if (uri.startsWith("ipfs://")) {
        httpURI = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      }

      // Fetch the metadata
      const response = await fetch(httpURI);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata for token ${tokenId}`);
      }

      const metadata = await response.json();

      // Convert IPFS image URL to HTTP URL if needed
      let imageUrl = metadata.image;
      if (imageUrl && imageUrl.startsWith("ipfs://")) {
        imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
      }

      // Create the NFT object
      const nft: NFT = {
        id: tokenId,
        name: metadata.name || `Hydro #${tokenId}`,
        image: imageUrl,
        attributes: metadata.attributes || [],
      };

      // Set the revealed NFTs array with just this one NFT
      setRevealedNFTs([nft]);
      setCurrentNFT(nft);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching NFT metadata:", error);
    }
  };

  // Navigation functions for RevealDialog
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

  return (
    <ClientOnly>
      <div className="w-full mx-auto px-4 pt-5 pb-2">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <div className="flex flex-col items-center justify-center">
            <span className="text-teal-50 font-herculanum text-sm sm:text-base uppercase tracking-widest">
              COLLECTION
            </span>
            <h1 className="hydros-title text-4xl md:text-5xl lg:text-6xl mb-12 text-center">
              MEET YOUR HYDROS
            </h1>
          </div>

          {!isConnected ? (
            <div className="price-table p-8 text-center w-max-w-[400px] mx-auto">
              <p className="text-muted-foreground mb-8">
                Please connect your wallet to view your collection.
              </p>
            </div>
          ) : loading ? (
            <>
              <LoadingPlaceholders />
            </>
          ) : error ? (
            <div className="price-table p-8 text-center">
              <p className="text-red-400 mb-8">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : ownedTokens.length === 0 ? (
            <div className="price-table p-8 text-center">
              <p className="text-muted-foreground mb-8">
                You don&apos;t own any Hydros NFTs yet.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-5">
                {displayedTokens.map((tokenId) => (
                  <div
                    key={tokenId}
                    className="flex justify-center cursor-pointer"
                    onClick={() => handleNFTClick(tokenId)}
                  >
                    <NFTCard tokenId={tokenId} tokenURI={tokenURIs[tokenId]} />
                  </div>
                ))}
              </div>

              {/* Load more indicator - this is observed by the Intersection Observer */}
              {hasMore && (
                <div ref={loadMoreRef} className="mt-8 py-4 text-center">
                  {loadingMore ? (
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    <span className="text-muted-foreground">
                      Loading more NFTs...
                    </span>
                  )}
                </div>
              )}

              {/* Display total count */}
              <div className="mt-6 text-center text-muted-foreground">
                Showing {displayedTokens.length} of {ownedTokens.length} NFTs
              </div>
            </>
          )}
        </MotionDiv>
      </div>

      {/* RevealDialog for viewing NFT details */}
      {currentNFT && (
        <RevealDialog
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          revealedNFTs={revealedNFTs}
          currentNFT={currentNFT}
          setCurrentNFT={setCurrentNFT}
          navigateToPrev={navigateToPrev}
          navigateToNext={navigateToNext}
          canNavigatePrev={canNavigatePrev}
          canNavigateNext={canNavigateNext}
        />
      )}
    </ClientOnly>
  );
}
