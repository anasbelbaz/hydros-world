import { publicClient } from "@/lib/client";
import { HYDROS_CONTRACT_ADDRESS } from "@/lib/config";
import { parseAbi } from "viem";
import { Abi } from "viem";
import React from "react";

// Define ABI for the token contract
const HydrosNFTABI = parseAbi([
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function totalSupply() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
]) as Abi;

export const ITEMS_PER_PAGE = 12;

type FetchOwnedTokensProps = {
  isConnected: boolean;
  address: string;
  setOwnedTokens: (tokens: number[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDisplayedTokens: (tokens: number[]) => void;
  setHasMore: (hasMore: boolean) => void;
};

export async function fetchOwnedTokens({
  isConnected,
  address,
  setOwnedTokens,
  setLoading,
  setError,
  setDisplayedTokens,
  setHasMore,
}: FetchOwnedTokensProps) {
  if (!isConnected || !address || !publicClient) {
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);

    // First get the total supply to know how many tokens to check
    const totalSupply = (await publicClient.readContract({
      address: HYDROS_CONTRACT_ADDRESS,
      abi: HydrosNFTABI,
      functionName: "totalSupply",
    })) as bigint;

    const supply = Number(totalSupply);
    const owned: number[] = [];

    // Check ownership for each token
    // This would be more efficient with a batch call or through event logs
    for (let i = 1; i <= supply; i++) {
      try {
        const owner = await publicClient.readContract({
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTABI,
          functionName: "ownerOf",
          args: [BigInt(i)],
        });

        // If the caller is the owner, add to owned tokens
        if (
          typeof owner === "string" &&
          owner.toLowerCase() === address.toLowerCase()
        ) {
          owned.push(i);
        }
      } catch (err) {
        // Skip tokens that don't exist or have errors
        console.error(`Error checking token ${i}:`, err);
      }
    }

    setOwnedTokens(owned);

    // Initialize displayed tokens with first batch
    const initialTokens = owned.slice(0, ITEMS_PER_PAGE);
    setDisplayedTokens(initialTokens);

    // Set hasMore flag
    setHasMore(owned.length > ITEMS_PER_PAGE);
  } catch (err) {
    console.error("Error fetching owned tokens:", err);
    setError("Failed to load your NFTs. Please try again later.");
  } finally {
    setLoading(false);
  }
}

type FetchTokenURIsProps = {
  displayedTokens: number[];
  tokenURIs: Record<number, string>;
  setTokenURIs: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  getTokenURI: (tokenId: number) => Promise<string>;
};

export async function fetchTokenURIs({
  displayedTokens,
  tokenURIs,
  setTokenURIs,
  getTokenURI,
}: FetchTokenURIsProps) {
  if (displayedTokens.length === 0) return;

  const uris: Record<number, string> = {};
  let hasNewURIs = false;

  for (const tokenId of displayedTokens) {
    try {
      // Skip if we already have this token URI
      if (tokenURIs[tokenId]) continue;

      const uri = await getTokenURI(tokenId);
      uris[tokenId] = uri;
      hasNewURIs = true;
    } catch (err) {
      console.error(`Error fetching URI for token ${tokenId}:`, err);
    }
  }

  // Only update state if we have new URIs to add
  if (hasNewURIs) {
    // Update tokenURIs by merging old and new URIs
    setTokenURIs((prev) => ({ ...prev, ...uris }));
  }
}

// Define animation keyframes in the global scope using a style tag
const animationKeyframes = `
@keyframes dot1 {
  0%, 100% { 
    opacity: 0.3;
    transform: translateY(0px);
  }
  20% { 
    opacity: 1;
    transform: translateY(-5px);
  }
}

@keyframes dot2 {
  0%, 100% { 
    opacity: 0.3;
    transform: translateY(0px);
  }
  40% { 
    opacity: 1;
    transform: translateY(-5px);
  }
}

@keyframes dot3 {
  0%, 100% { 
    opacity: 0.3;
    transform: translateY(0px);
  }
  60% { 
    opacity: 1;
    transform: translateY(-5px);
  }
}

.animate-dot1 {
  animation: dot1 1.4s infinite ease-in-out;
}

.animate-dot2 {
  animation: dot2 1.4s infinite ease-in-out;
}

.animate-dot3 {
  animation: dot3 1.4s infinite ease-in-out;
}
`;

// Client-side only loading component
export const LoadingPlaceholders = () => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] py-10">
    {/* Inject animation keyframes */}
    <style dangerouslySetInnerHTML={{ __html: animationKeyframes }} />

    <div className="flex flex-col items-center">
      <h3 className="text-xl font-herculanum text-teal-200 mb-4 text-center">
        FETCHING YOUR HYDROS
      </h3>

      <div className="flex items-center justify-center ">
        <span className="text-teal-400 text-4xl animate-dot1">.</span>
        <span className="text-teal-400 text-4xl animate-dot2">.</span>
        <span className="text-teal-400 text-4xl animate-dot3">.</span>
      </div>
    </div>
  </div>
);
