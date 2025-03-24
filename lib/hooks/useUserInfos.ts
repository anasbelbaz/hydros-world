"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { HYDROS_CONTRACT_ADDRESS } from "../config";
import { getBalance, readContract } from "viem/actions";
import { publicClient } from "../client";
import { Abi, Client, parseAbi } from "viem";

// For testing purposes - a simple Merkle tree with a few addresses
// In production, this would be generated server-side
export const generateMerkleProof = (
  address: `0x${string}` | undefined
): `0x${string}`[] => {
  if (!address) return [];

  try {
    // Try to load the Merkle proofs from localStorage
    if (typeof window !== "undefined") {
      // Check if we have any proofs stored in localStorage
      const storedProofs = localStorage.getItem("merkleProofs");
      if (storedProofs) {
        try {
          const proofs = JSON.parse(storedProofs);

          // Normalize the input address to lowercase for case-insensitive comparison
          const normalizedAddress = address.toLowerCase();

          // Check if the address has a proof in the loaded proofs
          if (proofs[normalizedAddress]) {
            console.log(
              `Found stored merkle proof for address ${normalizedAddress}`
            );
            return proofs[normalizedAddress] as `0x${string}`[];
          }

          console.log(`No stored proof found for address ${normalizedAddress}`);
        } catch (e) {
          console.error("Failed to parse stored merkle proofs:", e);
        }
      }
    }

    // Fallback to the special case for testing addresses
    // For demonstration purposes - in production these would be fetched from an API
    // Using test data for the given Merkle root: 0xf8aebec120740b38b7a9c779fd1dbccad210f75ffa13542bb2fdd1899f621d6f
    const testWhitelistedAddresses: Record<string, `0x${string}`[]> = {
      // Example addresses with their proofs for the specified root
      // Replace these with actual proofs for your Merkle tree
      "0x4cf877aca8ed18372bb28791c0c69339c27f7d78": [
        "0x523b14741c3b4fd4abbf54e1b0c9239c7d98888fbddd684f49ef7b47de710108",
      ],
      "0xD5de5a673C2FafeFbBE942B6A9Cbd30599D65Ec4": [
        "0xe8593bda6b9a4a695ede09b2076df180522e3bac297a6f5b9e4dbc4b43630d3d",
        "0x0c34dbce7f2c459885fa9652d1f4dd55a4c5775961e75463aa6bd6299ad31e26",
      ],
      "0xfC08eCB5a9467a37329D4f5B515BDd4752A331cB": [
        "0xb24e732b8d3e7a79e5b3d45135057c1cc2814cd92b281de351568300549f0142",
        "0x0c34dbce7f2c459885fa9652d1f4dd55a4c5775961e75463aa6bd6299ad31e26",
      ],
      // Add more whitelisted addresses and their proofs as needed
    };

    const normalizedAddress = address.toLowerCase();
    if (testWhitelistedAddresses[normalizedAddress]) {
      console.log(`Address ${normalizedAddress} is whitelisted with proof`);
      return testWhitelistedAddresses[normalizedAddress];
    }

    console.log(`Address ${normalizedAddress} is not whitelisted`);
    return [];
  } catch (error) {
    console.error("Error generating merkle proof:", error);
    return [];
  }
};

// Define ABI
const HydrosNFTSaleABI = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function whitelistMinted(address user) view returns (uint256)",
  "function isWhitelisted(address account, bytes32[] calldata proof) view returns (bool)",
]) as Abi;

// Keys for query caching
const QUERY_KEYS = {
  userBalance: (address: string) => ["userBalance", address],
};

export interface UserInfos {
  nftBalance: bigint;
  whitelistMinted: bigint;
  nativeBalance: bigint;
  isWhitelisted: boolean;
}

export function useUserInfos() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: QUERY_KEYS.userBalance(address || "0x"),
    queryFn: async (): Promise<UserInfos> => {
      if (!address || !isConnected) {
        return {
          nftBalance: BigInt(0),
          whitelistMinted: BigInt(0),
          nativeBalance: BigInt(0),
          isWhitelisted: false,
        };
      }

      try {
        // Get NFT balance and whitelist minted count
        const [nftBalance, whitelistMinted] = await Promise.all([
          readContract(publicClient as Client, {
            address: HYDROS_CONTRACT_ADDRESS,
            abi: HydrosNFTSaleABI,
            functionName: "balanceOf",
            args: [address],
          }),
          readContract(publicClient as Client, {
            address: HYDROS_CONTRACT_ADDRESS,
            abi: HydrosNFTSaleABI,
            functionName: "whitelistMinted",
            args: [address],
          }),
        ]);

        // Get native token balance
        const nativeBalance = await getBalance(publicClient as Client, {
          address,
        });

        // Get isWhitelisted status
        const isWhitelisted = (await readContract(publicClient as Client, {
          address: HYDROS_CONTRACT_ADDRESS,
          abi: HydrosNFTSaleABI,
          functionName: "isWhitelisted",
          args: [address, generateMerkleProof(address)],
        })) as boolean;

        return {
          nftBalance: nftBalance as bigint,
          whitelistMinted: whitelistMinted as bigint,
          nativeBalance: nativeBalance.valueOf(),
          isWhitelisted,
        };
      } catch (error) {
        console.error("Error fetching user balance:", error);
        return {
          isWhitelisted: false,
          nftBalance: BigInt(0),
          whitelistMinted: BigInt(0),
          nativeBalance: BigInt(0),
        };
      }
    },
    enabled: !!address && isConnected,
    // Refresh every 15 seconds while connected
    refetchInterval: isConnected ? 15000 : false,
  });
}
