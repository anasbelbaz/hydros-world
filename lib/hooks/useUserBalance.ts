"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { HYDROS_CONTRACT_ADDRESS } from "../config";
import { getBalance, readContract } from "viem/actions";
import { publicClient } from "../client";
import { Abi, Client, parseAbi } from "viem";

// Define ABI
const HydrosNFTSaleABI = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
  "function whitelistMinted(address user) view returns (uint256)",
]) as Abi;

// Keys for query caching
const QUERY_KEYS = {
  userBalance: (address: string) => ["userBalance", address],
};

export interface UserBalanceData {
  nftBalance: bigint;
  whitelistMinted: bigint;
  nativeBalance: bigint;
}

export function useUserBalance() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: QUERY_KEYS.userBalance(address || "0x"),
    queryFn: async (): Promise<UserBalanceData> => {
      if (!address || !isConnected) {
        return {
          nftBalance: BigInt(0),
          whitelistMinted: BigInt(0),
          nativeBalance: BigInt(0),
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

        return {
          nftBalance: nftBalance as bigint,
          whitelistMinted: whitelistMinted as bigint,
          nativeBalance: nativeBalance.valueOf(),
        };
      } catch (error) {
        console.error("Error fetching user balance:", error);
        return {
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
