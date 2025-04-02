"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { HYDROS_CONTRACT_ADDRESS } from "../config";
import { getBalance, readContract } from "viem/actions";
import { publicClient } from "../client";
import { Abi, Client, parseAbi } from "viem";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "viem/utils";
import { ENV } from "../env";

// For testing purposes - a simple Merkle tree with a few addresses
// In production, this would be generated server-side
export const generateMerkleProof = (
  address: `0x${string}` | undefined
): `0x${string}`[] => {
  if (!address) return [];

  try {
    // Create leaf nodes by hashing each address (matching backend's approach)
    const whitelistedAddresses = ENV.WHITELIST_ADDRESSES;
    const leaves = whitelistedAddresses.map((addr) =>
      keccak256(addr.toLowerCase() as `0x${string}`)
    );

    // Create Merkle tree
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    console.log("0x", merkleTree.getRoot().toString("hex"));
    // Generate proof for the given address
    const leaf = keccak256(address.toLowerCase() as `0x${string}`);
    const proof = merkleTree.getHexProof(leaf);

    return proof as `0x${string}`[];
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

export interface UserInfos {
  nftBalance: bigint;
  whitelistMinted: bigint;
  nativeBalance: bigint;
  isWhitelisted: boolean;
  merkleProof: `0x${string}`[];
}

export function useUserInfos() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["userInfos", address, isConnected],
    queryFn: async (): Promise<UserInfos> => {
      if (!address || !isConnected) {
        return {
          nftBalance: BigInt(0),
          whitelistMinted: BigInt(0),
          nativeBalance: BigInt(0),
          isWhitelisted: false,
          merkleProof: [],
        };
      }

      try {
        // Generate Merkle proof for the address
        const merkleProof = generateMerkleProof(address);

        // Get NFT balance, whitelist minted count, and check if whitelisted
        const [nftBalance, whitelistMinted, isWhitelisted] = await Promise.all([
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
          readContract(publicClient as Client, {
            address: HYDROS_CONTRACT_ADDRESS,
            abi: HydrosNFTSaleABI,
            functionName: "isWhitelisted",
            args: [address, merkleProof],
          }),
        ]);

        // Get native token balance
        const nativeBalance = await getBalance(publicClient as Client, {
          address,
        });

        return {
          nftBalance: nftBalance as bigint,
          whitelistMinted: whitelistMinted as bigint,
          nativeBalance: nativeBalance.valueOf(),
          isWhitelisted: isWhitelisted as boolean,
          merkleProof,
        };
      } catch (error) {
        console.error("Error fetching user info:", error);
        return {
          isWhitelisted: false,
          nftBalance: BigInt(0),
          whitelistMinted: BigInt(0),
          nativeBalance: BigInt(0),
          merkleProof: [],
        };
      }
    },
    enabled: !!address && isConnected,
    // Refresh every 15 seconds while connected
    refetchInterval: isConnected ? 15000 : false,
  });
}
