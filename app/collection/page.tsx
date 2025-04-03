"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { useReveal } from "@/lib/hooks/useReveal";
import { NFTCard } from "@/components/NFTCard";
import {
  fetchOwnedTokens,
  fetchTokenURIs,
  LoadingPlaceholders,
  ITEMS_PER_PAGE,
} from "./utils";
import Link from "next/link";
import { motion } from "framer-motion";

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

  return (
    <ClientOnly>
      <div className="w-full mx-auto max-w-[100rem] px-[3vw] pt-5 pb-2">
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
            <div className="px-4 py-2 mt-[12vh] text-center w-max-w-[400px] mx-auto">
              <p className="text-muted-foreground font-herculanum mb-8">
                You currently own no Hydros
              </p>
              
              <motion.div
                    whileHover={{ scale: 0.95 }}
                    whileTap={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 600, damping: 20 }}
                    className="w-fit mx-auto"
                  >
                <Link
                  href='/mint'
                  className='w-fit mx-auto'
                >
                  <Button className="relative overflow-hidden group bg-[#98FCE422] hover:bg-[#98FCE422] backdrop-blur-lg text-white border border-[#98FCE4]">
                  <span className="z-10 flex items-center gap-2">
                    Mint your hydros now
                    </span>
                    <div className="group-hover:scale-100 opacity-40 transition-transform duration-500 absolute transform scale-0 bg-[#98FCE4] min-h-full min-w-full aspect-square rounded-full inset-0 m-auto"></div>
                  </Button>
                </Link>
              </motion.div>
            </div>
          ) : loading ? (
            <>
              <LoadingPlaceholders />
            </>
          ) : error ? (
            <div className="price-table px-4 py-2 text-center">
              <p className="text-red-400 mb-8">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : ownedTokens.length === 0 ? (
            <div className="px-4 py-2 mt-[12vh] text-center w-max-w-[400px] mx-auto">
              <p className="text-muted-foreground font-herculanum mb-8">
                You currently own no Hydros
              </p>
              
              <motion.div
                    whileHover={{ scale: 0.95 }}
                    whileTap={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 600, damping: 20 }}
                    className="w-fit mx-auto"
                  >
                <Link
                  href='/mint'
                  className='w-fit mx-auto'
                >
                  <Button className="relative overflow-hidden group bg-[#98FCE422] hover:bg-[#98FCE422] backdrop-blur-lg text-white border border-[#98FCE4]">
                  <span className="z-10 flex items-center gap-2">
                    Mint your hydros now
                    </span>
                    <div className="group-hover:scale-100 opacity-40 transition-transform duration-500 absolute transform scale-0 bg-[#98FCE4] min-h-full min-w-full aspect-square rounded-full inset-0 m-auto"></div>
                  </Button>
                </Link>
              </motion.div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 md:grid-cols-4 gap-4">
                {displayedTokens.map((tokenId) => (
                  <div key={tokenId} className="flex justify-center">
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
    </ClientOnly>
  );
}
